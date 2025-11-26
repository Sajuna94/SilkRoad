from flask import request, jsonify, session
from models import User
from models import Admin,Vendor,Customer,Vendor_Manager
from config import db

def register_user():
    data = request.get_json()
    
    # 1. 提取參數
    role = data.get('role')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    
    address = data.get('address')
    mgr = data.get("manager")

    # 2. 基礎欄位檢查
    if not all([role, name, email, password, phone_number]):
        return jsonify({
            "message": "Columes are needed(role, name, email, password, phone_number)", 
            "success": False
        }), 400

    target_role = role.lower()
    new_user = None

    try:
        # 3. 根據角色呼叫 register
        # 如果有重複，register 方法會直接 '報錯' (raise ValueError)
        # 程式會跳到下面的 except ValueError 區塊
        
        if target_role == 'vendor':
            if not address or not mgr:
                return jsonify({"message": "Vendor address or manager_id are needed", "success": False}), 400

            # check manager fields
            mgr_necessary = ["name", "email", "phone_number"]
            mgr_missing = [field for field in mgr_necessary if not mgr.get(field)]
            if mgr_missing:
                return jsonify({
                    "message": f"Missing manager fields: {', '.join(mgr_missing)}",
                    "success": False
                }), 400

            #建立manager
            vndr_mgr = Vendor_Manager(
                name=mgr.get("name"),
                email=mgr.get("email"),
                phone_number=mgr.get("phone_number")
            )
            db.session.add(vndr_mgr)
            db.session.flush()

            new_user = Vendor.register(
                name=name, email=email, password=password, phone_number=phone_number,
                address=address,
                vendor_manager_id=vndr_mgr.id,
                is_active=True
            )
            

        elif target_role == 'customer':
            """
                TODO: guest cart should be created automatically
                
            """
            if not address:
                return jsonify({"message": "Customer need address", "success": False}), 400
            
            new_user = Customer.register(
                name=name, email=email, password=password, phone_number=phone_number,
                address=address,
                membership_level=0
            )
            
        elif target_role == 'admin':
            new_user = Admin.register(
                name=name, email=email, password=password, phone_number=phone_number
            )
        else:
            return jsonify({"message": "Invalid role", "success": False}), 400

        # 4. 存入資料庫
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        session['user_id'] = new_user.id
        session['role'] = target_role

    except ValueError:
        # [新增] 這裡專門捕捉 "重複註冊" 的錯誤 (由 User.register 拋出)
        # e 的內容就是 "Email has been registered" 或 "Phone number..."
        return jsonify({
            "message": "Email or Phonenumber has been registered",
            "success": False
        }), 409

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}", 
            "success": False
        }), 500

    return jsonify({
        "message": "Registration successful",              
        "success": True,
        "user_id": new_user.id
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
    user = User.query.filter_by(email=email).first()

    # 3. 檢查使用者是否存在，並驗證密碼
    # user.check_password() 會自動調用 check_password_hash
    if not user or not user.check_password(password):
        return jsonify({
            "message": "Email or password is incorrect",            
            "success": False
        }), 401

    # 4. 登入成功
    session["user_id"] = user.id
    session["role"] = user.role
    return jsonify({
        "data": {
            "id": user.id,          # 用於後續 API 請求 (例如 /cart/<user_id>)
            "name": user.name,      # 用於顯示
            "email": user.email,    # 用於顯示
            "role": user.role,      # 關鍵！用於前端路由判斷 (Router)
            "phone_number": user.phone_number
        },
        "message": "Login successful",
        "success": True
    }), 200
