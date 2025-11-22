from flask import request, jsonify
from models import User
from config import db
from werkzeug.security import generate_password_hash, check_password_hash


def register_user():
    """
    註冊新使用者
    """
    # 1. 從請求中獲取 JSON 資料
    data = request.get_json()
    
    # 2. 檢查必要欄位
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')

    if not all([name, email, password, phone_number]):
        return jsonify({"message": "缺少必要欄位 (name, email, password, phone_number)"}), 400

    # 3. 檢查 email 或 phone_number 是否已經存在
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email 已經被註冊"}), 409  # 409 Conflict

    if User.query.filter_by(phone_number=phone_number).first():
        return jsonify({"message": "電話號碼已經被註冊"}), 409

    # 4. 將密碼進行雜湊 (Hash)
    hashed_password = generate_password_hash(password)

    # 5. 建立新的 User 物件
    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        phone_number=phone_number
    )

    # 6. 將新使用者存入資料庫
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()  # 發生錯誤時回滾
        return jsonify({"message": f"資料庫錯誤: {str(e)}"}), 500

    # 7. 返回成功訊息
    return jsonify({"message": "使用者註冊成功"}), 201  # 201 Created

def login_user(): 
    """
    使用者登入
    """
    # 1. 獲取登入資料
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "缺少 email 或 password"}), 400

    # 2. 透過 email 尋找使用者
    user = User.query.filter_by(email=email).first()

    # 3. 檢查使用者是否存在，並驗證密碼
    # user.check_password() 會自動調用 check_password_hash
    if not user or not check_password_hash(password):
        return jsonify({"message": "Email 或密碼錯誤"}), 401  # 401 Unauthorized

    # 4. 登入成功
    # 
    # 注意：在一個真正的應用中，你不應該只返回 "登入成功"。
    # 你應該在這裡生成一個 JWT (JSON Web Token) 或設定一個 Session
    # 並將 token 返回給客戶端，以便他們在後續請求中驗證身份。
    #
    
    return jsonify({
        "message": "登入成功",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

    
