#by Fan
from flask import request, jsonify,session
from models import Customer
from models.store.review import Review
from models.auth.vendor import Vendor
from models.auth.customer import Customer
from config import db
from utils import require_login

@require_login(role=["customer"])
def post_vendor_review():
    """
    顧客根據訂單評論店家
    邏輯：Order ID -> 查訂單 -> 驗證 Session User -> 寫入評論
    """
    data = request.get_json()
    
    order_id = data.get('order_id')
    rating = data.get('rating')
    review_content = data.get('review_content')

    # 1. 檢查必要欄位
    if not all([order_id, rating]):
        return jsonify({"message": "Missing order_id or rating", "success": False}), 400

    try:
        rating = int(rating)
        if not (1 <= rating <= 5):
            raise ValueError
    except ValueError:
        return jsonify({"message": "Rating must be 1-5", "success": False}), 400

    # 2. [關鍵] 從 Session 獲取當前使用者的 ID
    customer_id = session.get('user_id')
    
    # 3. 查詢訂單
    order = order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found", "success": False}), 404
    
    # 4. [安全性驗證] 確保這筆訂單的主人，就是當前登入的 session 使用者
    # 這一步非常重要！防止 A 用戶拿 B 用戶的 order_id 來惡意評論
    if order.customer_id != customer_id:
        return jsonify({
            "message": "Unauthorized: You can only review your own orders", 
            "success": False
        }), 403

    # 5. 檢查是否重複評論 (針對這筆訂單)
    existing_review = Review.query.filter_by(order_id=order_id).first()
    if existing_review:
        return jsonify({"message": "You have already reviewed this order.", "success": False}), 409

    # 6. 建立評論 (使用 session 拿到的 customer_id)
    new_review = Review(
        customer_id=customer_id,    # <--- 這裡填入 session 的 ID
        vendor_id=order.vendor_id,  # <--- 從訂單自動抓取店家 ID
        order_id=order_id,
        rating=rating,
        review_content=review_content
    )

    try:
        db.session.add(new_review)
        db.session.commit()

        return jsonify({
            "data": [{
                "review_id": new_review.id,
                "customer_id": new_review.customer_id, # 回傳確認
                "vendor_id": new_review.vendor_id,
                "order_id": new_review.order_id,
                "rating": new_review.rating,
                "content": new_review.review_content,
                "created_at": new_review.created_at.isoformat() if new_review.created_at else None
            }],
            "message": "Review posted successfully",
            "success": True
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500