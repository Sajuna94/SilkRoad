from flask import request, jsonify, session
from models import User
from models import Admin,Vendor,Customer,Vendor_Manager,Cart,Cart_Item
from config import db
from utils import require_login

def register_step1():
    """
    第一步：驗證共同欄位 (Role, Name, Email, Password, Phone)
    並將資料暫存在 Session 中，不寫入 DB
    """
    data = request.get_json()
    
    # 1. 提取參數
    role = data.get('role')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')

    # 2. 基礎欄位檢查
    if not all([role, name, email, password, phone_number]):
        return jsonify({
            "message": "Columns are needed(role, name, email, password, phone_number)", 
            "success": False
        }), 400

    target_role = role.lower()
    if target_role not in ['vendor', 'customer']:
        return jsonify({"message": "Invalid role", "success": False}), 400

    # 3. 預先檢查 Email 與 Phone 是否重複 (Fail Fast)
    # 雖然 User.register 也會檢查，但在第一步就擋下來可以提升 UX
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email has been registered", "success": False}), 409
    if User.query.filter_by(phone_number=phone_number).first():
        return jsonify({"message": "Phone number has been registered", "success": False}), 409

    # 4. 將資料暫存入 Session
    # 注意：密碼在這裡是明文存 Session，建議 production 環境要確保是 HTTPS，
    # 或者在這裡先 hash 過再存 (但你的 User.register 有做 hash，所以這裡維持原樣)
    session['reg_temp'] = {
        'role': target_role,
        'name': name,
        'email': email,
        'password': password,
        'phone_number': phone_number
    }
    session.modified = True # 確保 session 被更新

    return jsonify({
        "message": "Step 1 passed. Please proceed to Step 2 with role-specific attributes.",
        "success": True,
    }), 201

def register_step2(role): # <--- 1. 這裡新增參數接收 URL 的 role
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
    # 避免 Step 1 選 Vendor，Step 2 卻故意打 /register/customer 的 API
    session_role = temp_data['role'] # session 裡原本存的就是小寫 (在 step1 處理過)
    url_role = role.lower()

    if url_role != session_role:
        return jsonify({
            "message": f"Role mismatch. Step 1 was '{session_role}', but URL is '{url_role}'",
            "success": False
        }), 400

    data = request.get_json()
    target_role = session_role # 使用驗證過的角色
    new_user = None
    
    # 用來暫存 manager 物件以便最後回傳使用 (僅 Vendor 用)
    created_manager = None 

    try:
        # ==========================================
        #  Vendor 邏輯
        # ==========================================
        if target_role == 'vendor':
            address = data.get('address')
            mgr = data.get('manager')

            if not address or not mgr:
                return jsonify({"message": "Vendor address and manager info are needed", "success": False}), 400

            # check manager fields
            mgr_necessary = ["name", "email", "phone_number"]
            mgr_missing = [field for field in mgr_necessary if not mgr.get(field)]
            if mgr_missing:
                return jsonify({
                    "message": f"Missing manager fields: {', '.join(mgr_missing)}",
                    "success": False
                }), 400

            # 建立 manager
            created_manager = Vendor_Manager(
                name=mgr.get("name"),
                email=mgr.get("email"),
                phone_number=mgr.get("phone_number")
            )
            db.session.add(created_manager)
            db.session.flush() # flush 以取得 manager id

            # 呼叫 Vendor.register
            new_user = Vendor.register(
                name=temp_data['name'], 
                email=temp_data['email'], 
                password=temp_data['password'], 
                phone_number=temp_data['phone_number'],
                address=address,
                vendor_manager_id=created_manager.id,
                is_active=True
            )
            
        # ==========================================
        #  Customer 邏輯
        # ==========================================
        elif target_role == 'customer':
            address = data.get('address')
            if not address:
                return jsonify({"message": "Customer needs address", "success": False}), 400
            
            # 1. 建立 Customer 物件
            new_user = Customer.register(
                name=temp_data['name'], 
                email=temp_data['email'], 
                password=temp_data['password'], 
                phone_number=temp_data['phone_number'],
                address=address,
                membership_level=0
            )

            # 2. 先加入 session 並 flush，以取得 new_user.id
            db.session.add(new_user)
            db.session.flush() 

            # 3. 檢查並轉移訪客購物車
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

        # 4. 最終提交
        if target_role != 'customer':
            db.session.add(new_user)
            
        db.session.commit()

        # 5. 註冊成功後的 Session 處理
        session.pop('reg_temp', None)
        session['user_id'] = new_user.id
        session['role'] = target_role

        # 回傳資料 (Response Data Construction)
        response_data = {}

        if target_role == 'customer':
            response_data = {
                "id": new_user.id,
                "role": "customer",
                "name": new_user.name,
                "email": new_user.email,
                "phone_number": new_user.phone_number,
                "address": new_user.address,
                "membership_level": new_user.membership_level,
                "is_active": new_user.is_active
            }
        
        elif target_role == 'vendor':
            response_data = {
                "id": new_user.id,
                "role": "vendor",
                "name": new_user.name,
                "email": new_user.email,
                "phone_number": new_user.phone_number,
                "address": new_user.address,
                "is_active": new_user.is_active,
                "manager": {
                    "id": created_manager.id,
                    "name": created_manager.name,
                    "email": created_manager.email,
                    "phone_number": created_manager.phone_number
                }
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

    # 6. 回傳最終結果
    return jsonify({
        "success": True,
        "message": "Registration successful",
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

    # 4. 登入成功：設定 Session
    session["user_id"] = user.id
    session["role"] = user.role

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
            "is_active": getattr(user, 'is_active', True)
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
            "manager": manager_info
        }

    # 5-4. Admin 或其他角色
    else:
        # Admin 只需要基礎資料
        response_data = base_info

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
    session.pop('user_id', None)
    session.pop('role', None)
    return jsonify({
        "message": "Logout successful",
        "success": True
    }), 200

@require_login(role=["admin", "vendor", "customer"])
def update_user(user_id):
    """
    更新會員資料 (不包含密碼)
    支援更新: name, phone_number, address (僅 Vendor/Customer), is_active (僅 Admin 操作)
    """
    data = request.get_json()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    # 提取參數
    name = data.get('name')
    phone_number = data.get('phone_number')
    address = data.get('address') # 只有 Vendor/Customer 有此欄位
    
    try:
        # 更新通用欄位
        if name:
            user.name = name
        if phone_number:
            # 若要更新電話，需檢查是否重複
            existing_phone = User.query.filter_by(phone_number=phone_number).first()
            if existing_phone and existing_phone.id != user.id:
                 return jsonify({"message": "Phone number already in use", "success": False}), 409
            user.phone_number = phone_number

        # 更新特定角色欄位 (Address)
        # 由於 SQLAlchemy 多型繼承，取得的 user 物件會自動是 Customer 或 Vendor 的實例
        if user.role in ['vendor', 'customer'] and address:
            user.address = address

        db.session.commit()

        return jsonify({
            "message": "User profile updated successfully",
            "success": True,
            "data": [{
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "phone_number": user.phone_number,
                "address": getattr(user, 'address', None) # 如果是 vendor/customer 嘗試回傳 address，否則回傳 None
            }]
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

@require_login(role=["admin", "vendor", "customer"])
def update_password(user_id):
    """
    更新會員密碼
    需要驗證舊密碼
    """
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not all([old_password, new_password]):
        return jsonify({"message": "Missing old_password or new_password", "success": False}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found", "success": False}), 404

    # 驗證舊密碼
    if not user.check_password(old_password):
        return jsonify({"message": "Old password is incorrect", "success": False}), 401

    try:
        # 設定新密碼 (假設 User model 有 set_password 方法)
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
        # 如果刪除的是自己，則清除 session
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
    