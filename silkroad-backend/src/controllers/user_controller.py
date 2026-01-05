from flask import request, jsonify, session, current_app
from models import User
from models import Admin,Vendor,Customer,Vendor_Manager,Cart,Cart_Item,System_Announcement,Review
from config import db
from config.mail import mail
from flask_mail import Message
from utils import require_login
from sqlalchemy import or_
import random
import string
from datetime import datetime, timedelta, timezone

def send_verification_email(user_email, code, subject="SilkRoad Email Verification"):
    """發送驗證碼郵件"""
    try:
        msg = Message(
            subject,
            recipients=[user_email]
        )
        msg.body = f"Your verification code is: {code}\nThis code will expire in 10 minutes."
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[Mail Error] {str(e)}")
        return False

def generate_verification_code(length=6):
    """生成 6 位數隨機驗證碼"""
    return ''.join(random.choices(string.digits, k=length))

def register_step1():
    """
    第一步：驗證共同欄位 (Role, Name, Email, Password, Phone)
    並將資料暫存在 Session 中，不寫入 DB
    """
    data = request.get_json()
    
    # 1. 提取參數
    role = data.get('role')
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')

    # 2. 基礎欄位檢查
    if not all([role, email, password, phone_number]):
        return jsonify({
            "message": "Columns are needed(role, email, password, phone_number)", 
            "success": False
        }), 400

    target_role = role.lower()
    if target_role not in ['vendor', 'customer']:
        return jsonify({"message": "Invalid role", "success": False}), 400

    # 3. 預先檢查 Email 與 Phone 是否重複
    # 如果是未驗證帳號，允許刪除重新註冊
    existing_user_by_email = User.query.filter_by(email=email).first()
    existing_user_by_phone = User.query.filter_by(phone_number=phone_number).first()

    # 檢查 Email
    if existing_user_by_email:
        if not existing_user_by_email.is_verified:
            # 刪除未驗證的舊帳號，允許重新註冊
            db.session.delete(existing_user_by_email)
        else:
            return jsonify({"message": "Email has been registered", "success": False}), 409

    # 檢查 Phone（注意：可能是同一個用戶）
    if existing_user_by_phone and existing_user_by_phone != existing_user_by_email:
        if not existing_user_by_phone.is_verified:
            # 刪除未驗證的舊帳號
            db.session.delete(existing_user_by_phone)
        else:
            return jsonify({"message": "Phone number has been registered", "success": False}), 409

    # 提交刪除操作
    if existing_user_by_email or existing_user_by_phone:
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

    # 4. 將資料暫存入 Session
    # 注意：密碼在這裡是明文存 Session，建議 production 環境要確保是 HTTPS，
    # 或者在這裡先 hash 過再存 (但你的 User.register 有做 hash，所以這裡維持原樣)
    session['reg_temp'] = {
        'role': target_role,
        'email': email,
        'password': password,
        'phone_number': phone_number
    }
    session.modified = True # 確保 session 被更新

    return jsonify({
        "message": "Step 1 passed. Please proceed to Step 2 with role-specific attributes.",
        "success": True,
    }), 201

def register_step2(role): 
    """
    第二步：接收角色特定欄位，合併 Session 資料，寫入 DB
    URL: /api/user/register/<role>
    """
    # 2. 檢查是否有第一步的暫存資料
    temp_data = session.get('reg_temp')
    if not temp_data:
        return jsonify({
            "message": "Session expired or Step 1 not completed.",
            "success": False
        }), 400

    # 3. [安全性檢查] 驗證 URL 傳來的 role 是否等於 Step 1 存下的 role
    session_role = temp_data['role']
    url_role = role.lower()

    if url_role != session_role:
        return jsonify({
            "message": f"Role mismatch. Step 1 was '{session_role}', but URL is '{url_role}'",
            "success": False
        }), 400

    data: dict = request.get_json()
    target_role = session_role 
    new_user = None
    
    # 記錄最終使用的 manager id (Vendor 用)
    target_manager_id = None

    try:
        name = data.get('name')
        address = data.get('address')
        #  Vendor 邏輯
        if target_role == 'vendor':
            mgr = data.get('manager')

            if not address or not mgr or not name:
                return jsonify({"message": "Vendor Address, Manager info and Name are needed", "success": False}), 400

            # check manager fields
            mgr_necessary = ["name", "email", "phone_number"]
            mgr_missing = [field for field in mgr_necessary if not mgr.get(field)]
            if mgr_missing:
                return jsonify({
                    "message": f"Missing manager fields: {', '.join(mgr_missing)}",
                    "success": False
                }), 400

            mgr_email = mgr.get("email")
            mgr_phone = mgr.get("phone_number")
            mgr_name = mgr.get("name")

            # 查詢資料庫：是否已經有這個 Email 或 電話 的 Manager
            existing_manager = Vendor_Manager.query.filter(
                or_(
                    Vendor_Manager.email == mgr_email,
                    Vendor_Manager.phone_number == mgr_phone
                )
            ).first()

            if existing_manager:
                # A. 如果找到了 -> 直接使用現有的 ID
                target_manager_id = existing_manager.id
            else:
                # B. 如果沒找到 -> 建立新的 Manager
                new_mgr = Vendor_Manager(
                    name=mgr_name,
                    email=mgr_email,
                    phone_number=mgr_phone
                )
                db.session.add(new_mgr)
                db.session.flush() # flush 以取得新生成的 id
                target_manager_id = new_mgr.id

            # 呼叫 Vendor.register
            new_user = Vendor.register(
                name=name, 
                email=temp_data['email'], 
                password=temp_data['password'], 
                phone_number=temp_data['phone_number'],
                address=address,
                vendor_manager_id=target_manager_id, # 使用上面判斷出來的 ID
                is_active=True,
                description=""
            )
            
        #  Customer 邏輯
        elif target_role == 'customer':
            if not address or not name:
                return jsonify({"message": "Customer needs address and name", "success": False}), 400
            
            # 1. 建立 Customer 物件
            new_user = Customer.register(
                name=name, 
                email=temp_data['email'], 
                password=temp_data['password'], 
                phone_number=temp_data['phone_number'],
                address=address,
                membership_level=0
            )

            # 2. 先加入 session 並 flush，以取得 new_user.id
            db.session.add(new_user)
            db.session.flush() 

            # 3. 檢查並轉移訪客購物車 (這部分可以在驗證後再做，或者現在做但不讓用戶操作)
            # 這裡選擇維持現狀，但在驗證通過前不設定登入 Session
            guest_cart = session.get('cart')
            if guest_cart and guest_cart.get("items"):
                
                # A. 建立資料庫 Cart
                new_db_cart = Cart(
                    customer_id=new_user.id,
                    vendor_id=guest_cart["vendor_id"]
                )
                db.session.add(new_db_cart)
                
                # B. 搬移商品
                for item in guest_cart["items"]:
                    new_db_item = Cart_Item(
                        cart_id=new_user.id,
                        product_id=item["product_id"],
                        quantity=item["quantity"],
                        selected_sugar=item["selected_sugar"],
                        selected_ice=item["selected_ice"],
                        selected_size=item["selected_size"]
                    )
                    db.session.add(new_db_item)
                
                # C. 清除 Session 購物車
                session.pop('cart', None)

        # 4. 生成驗證碼
        verification_code = generate_verification_code()
        new_user.verification_code = verification_code
        new_user.verification_code_expires_at = datetime.now() + timedelta(minutes=10)
        new_user.is_verified = False

        # 5. 最終提交
        if target_role != 'customer':
            db.session.add(new_user)
            
        db.session.commit()

        # 6. 發送驗證信 (非同步發送更好，但目前先同步處理)
        mail_sent = send_verification_email(new_user.email, verification_code)

        # 7. 註冊成功後的處理 (不設定登入 Session，要求跳轉驗證頁)
        session.pop('reg_temp', None)
        # 不要在這裡設定 user_id 和 role，因為還沒驗證
        # session['user_id'] = new_user.id
        # session['role'] = target_role
        
        # 回傳資料 (不包含敏感資訊，僅告知成功)
        response_data = {
            "email": new_user.email,
            "role": target_role,
            "requires_verification": True,
            "mail_sent": mail_sent
        }

    except ValueError as e:
        return jsonify({
            "message": str(e),
            "success": False
        }), 409

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}", 
            "success": False
        }), 500

    # 8. 回傳最終結果
    return jsonify({
        "success": True,
        "message": "Registration successful. Please verify your email.",
        "data": [response_data]
    }), 201

def login_user(): 
    # 1. 獲取登入資料
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            "message": "Need email or password",
            "success": False
        }), 400

    # 2. 透過 email 尋找使用者
    # 由於 SQLAlchemy 的多型特性，這裡取出的 user 會自動是 Customer, Vendor 或 Admin 的實例
    user = User.query.filter_by(email=email).first()

    # 3. 檢查使用者是否存在，並驗證密碼
    if not user or not user.check_password(password):
        return jsonify({
            "message": "Email or password is incorrect",            
            "success": False
        }), 401

    # 3.5 檢查是否已驗證 Email
    if not user.is_verified:
        return jsonify({
            "message": "Email not verified. Please verify your email first.",
            "success": False,
            "requires_verification": True,
            "email": user.email
        }), 403

    # 4. 登入成功：設定 Session
    session["user_id"] = user.id
    session["role"] = user.role
    session.modified = True # 確保 session 被更新

    # 4.5 [購物車合併] 如果是 Customer 且有訪客購物車，合併到資料庫
    if user.role == 'customer':
        guest_cart = session.get('cart')
        if guest_cart and guest_cart.get("items"):
            try:
                # A. 查詢或建立該 Customer 的 Cart
                existing_cart = Cart.query.filter_by(customer_id=user.id).first()

                if not existing_cart:
                    # 如果沒有購物車，建立新的
                    existing_cart = Cart(
                        customer_id=user.id,
                        vendor_id=guest_cart["vendor_id"]
                    )
                    db.session.add(existing_cart)
                else:
                    # 如果已有購物車但 vendor 不同，清空舊購物車
                    if existing_cart.vendor_id != guest_cart["vendor_id"]:
                        Cart_Item.query.filter_by(cart_id=user.id).delete()
                        existing_cart.vendor_id = guest_cart["vendor_id"]

                # B. 將訪客購物車的商品加入資料庫
                for item in guest_cart["items"]:
                    # 檢查是否已有相同商品和選項
                    existing_item = Cart_Item.query.filter_by(
                        cart_id=user.id,
                        product_id=item["product_id"],
                        selected_sugar=item["selected_sugar"],
                        selected_ice=item["selected_ice"],
                        selected_size=item["selected_size"]
                    ).first()

                    if existing_item:
                        # 如果已存在相同商品，增加數量
                        existing_item.quantity += item["quantity"]
                    else:
                        # 否則新增商品
                        new_item = Cart_Item(
                            cart_id=user.id,
                            product_id=item["product_id"],
                            quantity=item["quantity"],
                            selected_sugar=item["selected_sugar"],
                            selected_ice=item["selected_ice"],
                            selected_size=item["selected_size"]
                        )
                        db.session.add(new_item)

                # C. 提交資料庫變更
                db.session.commit()

                # D. 清除 Session 購物車
                session.pop('cart', None)
                session.modified = True

            except Exception as e:
                # 如果合併失敗，記錄錯誤但不影響登入流程
                db.session.rollback()
                pass  # 購物車合併失敗時繼續登入流程

    # 5. [關鍵修改] 根據角色組裝回傳資料
    response_data = {}

    # 5-1. 基礎資料 (所有角色都有)
    base_info = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone_number": user.phone_number,
        "created_at": user.created_at
    }
    
    # 5-2. Customer 特有資料
    if user.role == 'customer':
        # 使用 getattr 避免萬一欄位不存在報錯 (雖然理論上 Model 有定義)
        response_data = {
            **base_info,
            "address": getattr(user, 'address', None),
            "membership_level": getattr(user, 'membership_level', 0),
            "is_active": getattr(user, 'is_active', True),
            "stored_balance": getattr(user, 'stored_balance', 0)
        }

    # 5-3. Vendor 特有資料 (包含 Manager)
    elif user.role == 'vendor':
        manager_info = None
        
        # 嘗試獲取經理資料
        # 假設 Vendor Model 有 vendor_manager_id 欄位
        mgr_id = getattr(user, 'vendor_manager_id', None)
        if mgr_id:
            manager = Vendor_Manager.query.get(mgr_id)
            if manager:
                manager_info = {
                    "id": manager.id,
                    "name": manager.name,
                    "email": manager.email,
                    "phone_number": manager.phone_number
                }

        response_data = {
            **base_info,
            "address": getattr(user, 'address', None),
            "is_active": getattr(user, 'is_active', True),
            "description": getattr(user, 'description', ""),
            "logo_url": getattr(user, 'logo_url', None),
            "revenue": getattr(user, 'revenue', 0),
            "vendor_manager": manager_info
        }

    # 5-4. Admin 或其他角色
    else:
        # Admin 只需要基礎資料
        response_data = base_info

    session['user'] = response_data
    session.modified = True # 確保 session 被更新

    return jsonify({
        "data": [response_data],
        "message": "Login successful",
        "success": True
    }), 200


@require_login(role=["admin", "vendor", "customer"])
def logout_user():
    """
    會員登出
    目前為無狀態 API，主要由前端清除資訊，後端回傳成功訊息即可。
    若未來有使用 Session 或 Redis 黑名單，在此處處理。
    """
    session.clear()
    return jsonify({
        "message": "Logout successful",
        "success": True
    }), 200

@require_login(role=["admin", "vendor", "customer"])
def update_user():
    """
    更新當前登入會員資料 (Route: /me)
    Method: PATCH
    """
    # 1. 從 Session 取得當前使用者 ID
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({"message": "Not logged in", "success": False}), 401

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    data = request.get_json()
    
    # 2. 提取參數 (PATCH 允許只傳部分欄位)
    name = data.get('name')
    phone_number = data.get('phone_number')
    address = data.get('address') 
    
    try:
        # 3. 更新邏輯
        if name is not None:
            user.name = name
            
        if phone_number:
            # 檢查電話是否被其他人使用
            existing_phone = User.query.filter_by(phone_number=phone_number).first()
            if existing_phone and existing_phone.id != user.id:
                 return jsonify({"message": "Phone number already in use", "success": False}), 409
            user.phone_number = phone_number

        # 更新特定角色欄位 (Address)
        if user.role in ['vendor', 'customer'] and address is not None:
            user.address = address

        db.session.commit()

        # 4. 組裝回傳資料 (保持與 Login/Register 結構一致)
        # 這是為了讓前端更新 context 時不會少欄位
        response_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number,
            "created_at": user.created_at
        }

        # Customer 特有欄位
        if user.role == 'customer':
            response_data.update({
                "address": getattr(user, 'address', None),
                "membership_level": getattr(user, 'membership_level', 0),
                "is_active": getattr(user, 'is_active', True),
                "stored_balance": getattr(user, 'stored_balance', 0)
            })

        # Vendor 特有欄位 (包含 Manager)
        elif user.role == 'vendor':
            manager_info = None
            mgr_id = getattr(user, 'vendor_manager_id', None)
            if mgr_id:
                manager = Vendor_Manager.query.get(mgr_id)
                if manager:
                    manager_info = {
                        "id": manager.id,
                        "name": manager.name,
                        "email": manager.email,
                        "phone_number": manager.phone_number
                    }
            
            response_data.update({
                "address": getattr(user, 'address', None),
                "is_active": getattr(user, 'is_active', True),
                "description": getattr(user, 'description', ""),
                "manager": manager_info
            })

        return jsonify({
            "message": "User profile updated successfully",
            "success": True,
            "data": [response_data]
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

@require_login(role=["admin", "vendor", "customer"])
def update_password():
    """
    更新當前登入會員密碼
    Route: /me/password
    Method: PATCH
    """
    # 1. 從 Session 取得 User ID
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({"message": "Not logged in", "success": False}), 401

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not all([old_password, new_password]):
        return jsonify({"message": "Missing old_password or new_password", "success": False}), 400

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    # 2. 驗證舊密碼
    if not user.check_password(old_password):
        return jsonify({"message": "Old password is incorrect", "success": False}), 401

    try:
        # 3. 設定新密碼
        user.set_password(new_password)
        db.session.commit()

        return jsonify({
            "message": "Password updated successfully",
            "success": True
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

@require_login(role=["admin", "vendor", "customer"])
def delete_user(user_id):
    """
    刪除會員
    """
    current_user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        if current_user_id == user_id:
            session.pop('user_id', None)
            session.pop('role', None)

        return jsonify({
            "message": "User deleted successfully",
            "success": True
        }), 200

    except Exception as e:
        db.session.rollback()
        # 通常刪除失敗是因為有外鍵關聯 (例如有訂單紀錄)，這時候不能硬刪
        return jsonify({
            "message": f"Cannot delete user (Foreign Key Constraint): {str(e)}",
            "success": False
        }), 500
    
def current_user():
    """
    取得當前登入用戶的最新資料
    從資料庫查詢以確保資料是最新的
    """
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "Not logged in"}), 401

    # 從資料庫查詢最新用戶資料
    user = User.query.get(user_id)
    if not user:
        # 用戶已被刪除,清除 session
        session.clear()
        return jsonify({"success": False, "message": "User not found"}), 404

    # 根據角色組裝回傳資料 (與 login_user 相同邏輯)
    response_data = {}

    # 基礎資料 (所有角色都有)
    base_info = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone_number": user.phone_number,
        "created_at": user.created_at
    }

    # Customer 特有資料
    if user.role == 'customer':
        response_data = {
            **base_info,
            "address": getattr(user, 'address', None),
            "membership_level": getattr(user, 'membership_level', 0),
            "is_active": getattr(user, 'is_active', True),
            "stored_balance": getattr(user, 'stored_balance', 0)
        }

    # Vendor 特有資料
    elif user.role == 'vendor':
        manager_info = None

        # 獲取經理資料
        mgr_id = getattr(user, 'vendor_manager_id', None)
        if mgr_id:
            manager = Vendor_Manager.query.get(mgr_id)
            if manager:
                manager_info = {
                    "id": manager.id,
                    "name": manager.name,
                    "email": manager.email,
                    "phone_number": manager.phone_number
                }

        response_data = {
            **base_info,
            "address": getattr(user, 'address', None),
            "is_active": getattr(user, 'is_active', True),
            "description": getattr(user, 'description', ""),
            "logo_url": getattr(user, 'logo_url', None),
            "revenue": getattr(user, 'revenue', 0),
            "vendor_manager": manager_info
        }

    # Admin 或其他角色
    else:
        response_data = base_info

    return jsonify({"success": True, "data": response_data}), 200

def get_all_announcements():
    """
    列出所有系統公告 (建議依時間倒序排列)
    """
    try:
        # 依建立時間由新到舊排序
        announcements = System_Announcement.query.order_by(System_Announcement.created_at.desc()).all()

        result = [{
            "id": a.id,
            "admin_id": a.admin_id,
            "message": a.message,
            "created_at": a.created_at.isoformat() if a.created_at else None
        } for a in announcements]

        return jsonify({
            "success": True,
            "message": "Retrieved all announcements successfully",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500
    
# 新的一般用戶可用的 endpoint
def get_vendor_ids():
    """
    取得所有可用店家的ID列表 (一般用戶可用)
    """
    try:
        # 只查詢啟用且已驗證的店家，只返回 ID
        vendors = Vendor.query.filter_by(is_active=True, is_verified=True).all()
        
        vendor_ids = [v.id for v in vendors]

        return jsonify({
            "success": True,
            "message": "Retrieved vendor IDs successfully",
            "data": vendor_ids
        }), 200

    except Exception as e:
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500



@require_login(role='customer')
def topup_balance():
    """
    Customer top-up balance
    Route: /api/user/topup
    Method: POST

    Expect:
    {
        "amount": int (1 - 999999)
    }

    Return:
    {
        "success": True,
        "message": "儲值成功",
        "data": {
            "new_balance": int,
            "added_amount": int
        }
    }
    """
    # 1. 從 session 獲取當前 customer user_id
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({"message": "Not logged in", "success": False}), 401

    # 2. 從 request.json 獲取儲值金額
    data = request.get_json()
    amount = data.get('amount')

    # 3. 驗證金額
    if amount is None:
        return jsonify({"message": "Amount is required", "success": False}), 400

    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return jsonify({"message": "Amount must be a valid integer", "success": False}), 400

    if amount <= 0:
        return jsonify({"message": "金額必須大於 0", "success": False}), 400

    if amount > 999999:
        return jsonify({"message": "單次儲值上限為 999999", "success": False}), 400

    # 4. 查詢 Customer 實例
    customer = Customer.query.get(current_user_id)
    if not customer:
        return jsonify({"message": "Customer not found", "success": False}), 404

    try:
        # 5. 更新餘額
        old_balance = customer.stored_balance or 0
        customer.stored_balance = old_balance + amount
        new_balance = customer.stored_balance

        # 6. 提交到資料庫
        db.session.commit()

        # 7. 更新 session 中的 user 資料
        if session.get('user'):
            session['user']['stored_balance'] = new_balance
            session.modified = True

        # 8. 回傳結果
        return jsonify({
            "success": True,
            "message": "儲值成功",
            "data": {
                "new_balance": new_balance,
                "added_amount": amount
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500
    
def get_vendor_reviews(vendor_id):
    """
    取得指定店家的所有評論 (僅內容、評分、時間)
    URL: /api/user/vendor/<vendor_id>/reviews
    Method: GET
    權限: Public (公開)
    """
    try:
        # 1. 確認店家是否存在且已驗證
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({
                "message": "Vendor not found",
                "success": False
            }), 404

        if not vendor.is_verified:
            return jsonify({
                "message": "Vendor not verified",
                "success": False
            }), 403

        # 2. 查詢該店家的所有評論，依時間倒序排列
        reviews = Review.query.filter_by(vendor_id=vendor_id)\
            .order_by(Review.created_at.desc())\
            .all()

        # 3. 組裝回傳資料
        result = []
        
        for r in reviews:
            # 不需要查詢 Customer 了，直接取 Review 本身的欄位
            result.append({
                "review_id": r.id,
                "rating": r.rating,
                "content": r.review_content,
                "order_id": r.order_id,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })

        return jsonify({
            "success": True,
            "message": f"Retrieved {len(result)} reviews for vendor {vendor_id}",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500

def verify_email():
    """驗證 Email 驗證碼"""
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({"message": "Email and code are required", "success": False}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    if user.is_verified:
        return jsonify({"message": "Email already verified", "success": True}), 200

    # 檢查驗證碼
    if user.verification_code != code:
        return jsonify({"message": "Invalid verification code", "success": False}), 400

    # 檢查是否過期
    if user.verification_code_expires_at and user.verification_code_expires_at.replace(tzinfo=None) < datetime.now():
        return jsonify({"message": "Verification code expired", "success": False}), 400

    try:
        user.is_verified = True
        user.verification_code = None
        user.verification_code_expires_at = None
        db.session.commit()

        # 自動登入：設定 Session
        session["user_id"] = user.id
        session["role"] = user.role
        session.modified = True 

        # 處理購物車合併邏輯 (與 login_user 相同)
        if user.role == 'customer':
            guest_cart = session.get('cart')
            if guest_cart and guest_cart.get("items"):
                try:
                    existing_cart = Cart.query.filter_by(customer_id=user.id).first()
                    if not existing_cart:
                        existing_cart = Cart(customer_id=user.id, vendor_id=guest_cart["vendor_id"])
                        db.session.add(existing_cart)
                    else:
                        if existing_cart.vendor_id != guest_cart["vendor_id"]:
                            Cart_Item.query.filter_by(cart_id=user.id).delete()
                            existing_cart.vendor_id = guest_cart["vendor_id"]

                    for item in guest_cart["items"]:
                        existing_item = Cart_Item.query.filter_by(
                            cart_id=user.id,
                            product_id=item["product_id"],
                            selected_sugar=item["selected_sugar"],
                            selected_ice=item["selected_ice"],
                            selected_size=item["selected_size"]
                        ).first()
                        if existing_item:
                            existing_item.quantity += item["quantity"]
                        else:
                            new_item = Cart_Item(
                                cart_id=user.id,
                                product_id=item["product_id"],
                                quantity=item["quantity"],
                                selected_sugar=item["selected_sugar"],
                                selected_ice=item["selected_ice"],
                                selected_size=item["selected_size"]
                            )
                            db.session.add(new_item)
                    db.session.commit()
                    session.pop('cart', None)
                    session.modified = True
                except Exception:
                    db.session.rollback()

        return jsonify({
            "message": "Email verified successfully. You are now logged in.",
            "success": True
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

def resend_verification_code():
    """重新發送驗證碼"""
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required", "success": False}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    if user.is_verified:
        return jsonify({"message": "Email already verified", "success": True}), 200

    try:
        code = generate_verification_code()
        user.verification_code = code
        user.verification_code_expires_at = datetime.now() + timedelta(minutes=10)
        db.session.commit()

        mail_sent = send_verification_email(user.email, code)
        return jsonify({
            "message": "Verification code resent",
            "success": True,
            "mail_sent": mail_sent
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

# ==================== Forgot Password Functions ====================

def forgot_password_send_code():
    """忘記密碼 - 發送驗證碼"""
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required", "success": False}), 400

    # 查找用戶（只能是已驗證的用戶才能重置密碼）
    user = User.query.filter_by(email=email, is_verified=True).first()
    if not user:
        return jsonify({"message": "找不到該帳號或帳號未驗證", "success": False}), 404

    try:
        # 生成6位驗證碼
        code = generate_verification_code()
        user.verification_code = code
        user.verification_code_expires_at = datetime.now() + timedelta(minutes=10)
        db.session.commit()

        # 發送驗證碼郵件
        mail_sent = send_verification_email(user.email, code, subject="密碼重置驗證碼")

        return jsonify({
            "message": "驗證碼已發送至您的信箱",
            "success": True,
            "mail_sent": mail_sent
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500


def forgot_password_verify_code():
    """忘記密碼 - 驗證驗證碼"""
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({"message": "Email and code are required", "success": False}), 400

    user = User.query.filter_by(email=email, is_verified=True).first()
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    # 檢查驗證碼
    if user.verification_code != code:
        return jsonify({"message": "驗證碼錯誤", "success": False}), 400

    # 檢查是否過期
    if user.verification_code_expires_at and datetime.now() > user.verification_code_expires_at:
        return jsonify({"message": "驗證碼已過期，請重新發送", "success": False}), 400

    return jsonify({
        "message": "驗證成功，請設定新密碼",
        "success": True
    }), 200


def reset_password():
    """忘記密碼 - 重置密碼"""
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')

    if not email or not code or not new_password:
        return jsonify({
            "message": "Email, code, and new_password are required",
            "success": False
        }), 400

    # 驗證密碼強度
    if len(new_password) < 6:
        return jsonify({"message": "密碼長度至少需要6個字元", "success": False}), 400

    user = User.query.filter_by(email=email, is_verified=True).first()
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    # 再次檢查驗證碼（安全考量）
    if user.verification_code != code:
        return jsonify({"message": "驗證碼錯誤", "success": False}), 400

    # 檢查是否過期
    if user.verification_code_expires_at and datetime.now() > user.verification_code_expires_at:
        return jsonify({"message": "驗證碼已過期，請重新發送", "success": False}), 400

    try:
        # 更新密碼
        user.set_password(new_password)
        # 清除驗證碼（防止重複使用）
        user.verification_code = None
        user.verification_code_expires_at = None
        db.session.commit()

        return jsonify({
            "message": "密碼重置成功，請重新登入",
            "success": True
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500