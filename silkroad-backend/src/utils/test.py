"""
    =============================================================================
    This file is the basic test for any functionality you want to try out.
    The path is /api/test/...
    =============================================================================
"""
from werkzeug.security import generate_password_hash
from flask import Blueprint, jsonify,request
from models import *
from config import db
from datetime import date, timedelta
test_routes = Blueprint("test", __name__)

# for frontend testing purpose
@test_routes.route("/ping", methods=["GET"])
def ping():
    # Returns "pong" to show the backend is running
    return jsonify({"message": "pong"}), 401

# CURD test route
@test_routes.route("/Insert")
def test_insert():
    try:
        new_user = User(
            name="Test User",
            email="testuser@example.com",
            password="12434544",  # 密碼要 hash
            phone_number="0912345678"
        )
        # 加入 session
        db.session.add(new_user)  
        db.session.commit()
        return {"status": "insert success"}
    except Exception as e:
        return {"error": str(e)}

@test_routes.route("/Update")
def test_update():
    usr = User.query.filter_by(password="12434544").first()
    if not usr: 
        return jsonify({"error": "user.1 not found"}), 404
    usr.name = "Gay"
    try:
        db.session.commit()
        return jsonify({"message": "user.1 name changed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@test_routes.route("/Delete")
def test_delete():
    usr = User.query.filter_by(password="12434544").first()
    if not usr: 
        return jsonify({"error": "user.1 not found"}), 404
    try:
        db.session.delete(usr)
        db.session.commit()
        return jsonify({"message": "user.1 deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@test_routes.route("/Select")
def test_select():
    usr = User.query.filter_by(password="12434544").first()
    if usr:
        return jsonify({
            "id": usr.id,
            "name": usr.name,
            "email": usr.email,
            "phone_number": usr.phone_number,
            "created_at": usr.created_at
        })
    return jsonify({"error": "user.1 not found"}), 404

@test_routes.route("/Clear")
def clear_all_users():
    """
    刪除所有資料 (包含 Reviews)
    """
    try:
        # 刪除評論
        db.session.query(Review).delete()
        # 刪除系統公告 & 封鎖紀錄
        db.session.query(Block_Record).delete()
        db.session.query(System_Announcement).delete()
        # 刪除 product (如果有)
        # db.session.query(Product).delete()
        
        # 刪除繼承表
        db.session.query(Vendor).delete()
        db.session.query(Customer).delete()
        db.session.query(Admin).delete()
        
        # 刪除核心表
        db.session.query(User).delete()
        db.session.query(Vendor_Manager).delete()
        
        db.session.commit()
        return jsonify({"message": "已清除所有資料"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@test_routes.route("/init_manager")
def init_manager():
    """
    初始化 Vendor Manager (如果不存在則建立)
    """
    email = "boss@manager.com"
    manager = Vendor_Manager.query.filter_by(email=email).first()

    if not manager:
        manager = Vendor_Manager(
            name="Big Boss",
            email=email,
            phone_number="0999999999"
        )
        db.session.add(manager)
        db.session.commit()
        print("[test] Vendor Manager created:", manager.id)
        return jsonify({"message": "Manager Created", "id": manager.id}), 201
    
    return jsonify({"message": "Manager Already Exists", "id": manager.id}), 200

@test_routes.route("/init_users")
def init_data():
    """
    初始化 Admin, Vendor 和 Customer 測試資料
    """
    try:
        # 1. 確認 Manager
        manager = Vendor_Manager.query.first()
        if not manager:
            return jsonify({"error": "請先執行 /api/test/init_manager 建立經理資料"}), 400

        # 2. 建立 Admin
        admin_email = "admin@test.com"
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = Admin(
                name="SuperAdmin", 
                email=admin_email, 
                password=generate_password_hash("123"),
                phone_number="0900000000"
            )
            db.session.add(admin)
            print("[test] Admin created")

        # 3. 建立 Vendor
        vendor_email = "vendor@test.com"
        vendor = User.query.filter_by(email=vendor_email).first()
        if not vendor:
            vendor = Vendor(
                name="Bad Vendor",
                email=vendor_email,
                password=generate_password_hash("123"),
                phone_number="0911111111",
                address="Taipei City",
                vendor_manager_id=manager.id,
                is_active=True,
                description="This is a test vendor."
            )
            db.session.add(vendor)
            print("[test] Vendor created")

        # 4. [新增] 建立 Customer
        customer_email = "customer@test.com"
        customer = User.query.filter_by(email=customer_email).first()
        if not customer:
            customer = Customer(
                name="Happy Customer",
                email=customer_email,
                password=generate_password_hash("password123"),
                phone_number="0922222222",
                address="Kaohsiung City",
                membership_level=0,
                is_active=True
            )
            db.session.add(customer)
            print("[test] Customer created")

        db.session.commit()
        
        return jsonify({
            "status": "Admin, Vendor and Customer init success",
            "admin_id": admin.id, 
            "vendor_id": vendor.id,
            "customer_id": customer.id  # 回傳 Customer ID
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[Error] {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@test_routes.route("/init_admin")
def init_admin():
    """
    初始化 Admin測試資料
    """
    try:
        # 2. 建立 Admin
        admin_email = "admin@test.com"
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = Admin(
                name="SuperAdmin", 
                email=admin_email, 
                password=generate_password_hash("123"),
                phone_number="0900000000"
            )
            db.session.add(admin)
            print("[test] Admin created")

        db.session.commit()
        
        return jsonify({
            "status": "Admin init success",
            "admin_id": admin.id
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[Error] {str(e)}")
        return jsonify({"error": str(e)}), 500

# Migrated endpoints:
# - /users → /api/admin/users
# - /block_records → /api/admin/block-records
# - /announcements → /api/admin/announcements (already existed)
# - /reviews → /api/user/vendor/<vendor_id>/reviews (already existed)

@test_routes.route("/insert_order_to_customer", methods=["POST"])
def insert_test_order():
    """
    建立一筆測試訂單給指定的 Customer
    預設向 Vendor ID = 3 購買商品
    """
    data = request.get_json()
    customer_id = data.get("customer_id")
    vendor_id = data.get("vendor_id", 3)  # 預設為店家 3

    if not customer_id:
        return jsonify({"error": "Missing customer_id"}), 400

    try:
        # 1. 檢查 Customer 是否存在
        customer = Customer.query.filter_by(user_id=customer_id).first() # 注意：如果是用 user_id 關聯
        # 或者如果是直接查 User 表: customer = User.query.get(customer_id)
        # 這裡假設你的 Customer 表主鍵是 id，或者有 user_id 欄位
        
        # 2. 建立訂單主體 (Order)
        # 先設 total_price 為 0，稍後計算
        new_order = Order(
            user_id=customer_id,
            vendor_id=vendor_id,
            total_price=0, 
            note="API 測試訂單 - 自動生成",
            payment_methods="cash", # 根據你的 Enum: 'cash' 或 'button'
            is_delivered=False,
            is_completed=False,
            refund_status=None
        )
        
        db.session.add(new_order)
        db.session.flush() # 先 flush 以取得 new_order.id，但還不 commit

        # 3. 建立訂單細項 (Order Items)
        # 根據你提供的資料：Vendor 3 有商品 29 ($1) 和 35 ($100)
        
        # 模擬商品 1: 花椰菜奶昔 (ID 29)
        product_a = Product.query.get(29)
        item_a_price = product_a.price if product_a else 1
        
        item1 = Order_Item(
            order_id=new_order.id,
            product_id=29, # 花椰菜奶昔
            quantity=1,
            price=item_a_price, # 記錄當下價格
            # 假設 Order_Item 有這些選項欄位，沒有的話請移除
            selected_sugar="Half", 
            selected_ice="No Ice",
            selected_size="Regular"
        )

        # 模擬商品 2: sigmadrink (ID 35)
        product_b = Product.query.get(35)
        item_b_price = product_b.price if product_b else 100

        item2 = Order_Item(
            order_id=new_order.id,
            product_id=35, # sigmadrink
            quantity=2,    # 買 2 個
            price=item_b_price,
            selected_sugar="Regular",
            selected_ice="Regular",
            selected_size="Large"
        )

        db.session.add(item1)
        db.session.add(item2)

        # 4. 計算並更新總金額
        # 1 * 1 + 2 * 100 = 201
        total_amount = (item1.quantity * item1.price) + (item2.quantity * item2.price)
        new_order.total_price = total_amount

        # 5. 提交
        db.session.commit()

        return jsonify({
            "message": "Order created successfully",
            "order_id": new_order.id,
            "total_price": new_order.total_price,
            "items": [
                {"product_id": 29, "name": "花椰菜奶昔", "qty": 1},
                {"product_id": 35, "name": "sigmadrink", "qty": 2}
            ]
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[Error] {str(e)}")
        return jsonify({"error": str(e)}), 500
    

@test_routes.route("/insert_discount_policy", methods=["POST"])
def insert_test_discount():
    """
    為指定店家 (預設 ID=3) 新增一個測試用的折扣政策
    內容：滿 100 打 8 折 (20% off)，上限折抵 50 元，期限 30 天
    """
    data = request.get_json() or {}
    
    # 預設幫 Vendor ID = 3 新增，也可以透過參數修改
    target_vendor_id = data.get("vendor_id", 3)

    try:
        # 計算到期日：今天是 + 30 天
        expire_day = date.today() + timedelta(days=30)

        new_policy = Discount_Policy(
            vendor_id=target_vendor_id,
            is_available=True,
            type='percent',       # Enum: 'percent' 或 'fixed'
            value=20,             # 20 代表 20% off (視你的商業邏輯定義)
            min_purchase=100,     # 最低消費
            max_discount=50,      # 最高折抵金額
            membership_limit=0,   # 0 代表不限會員等級
            expiry_date=expire_day
        )

        db.session.add(new_policy)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Discount Policy created successfully",
            "data": {
                "policy_id": new_policy.id,
                "vendor_id": new_policy.vendor_id,
                "type": new_policy.type,
                "value": new_policy.value,
                "min_purchase": new_policy.min_purchase,
                "expiry_date": str(new_policy.expiry_date)
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[Error] {str(e)}")
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500