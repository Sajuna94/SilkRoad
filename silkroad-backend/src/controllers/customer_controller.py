from flask import request, jsonify, session
# 請確認這行的引入路徑是正確的，如果 Order.py 在 models 資料夾下，通常是 from models import Order
from models import Order 
from models.store.review import Review
from config import db
from utils import require_login

@require_login(role=["customer"])
def post_vendor_review():
    """
    顧客根據訂單評論店家
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

    # 2. 從 Session 獲取當前使用者的 ID
    current_user_id = session.get('user_id')
    
    # 3. 查詢訂單 
    # [修正 1] 使用大寫 Order (類別) 來查詢，避免變數名稱衝突
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"message": "Order not found", "success": False}), 404
    
    # 4. [安全性驗證] 
    # [修正 2] 你的 Order Model 欄位叫做 user_id，不是 customer_id
    if order.user_id != current_user_id:
        return jsonify({
            "message": "Unauthorized: You can only review your own orders", 
            "success": False
        }), 403

    # 5. 檢查是否重複評論
    existing_review = Review.query.filter_by(order_id=order_id).first()
    if existing_review:
        return jsonify({"message": "You have already reviewed this order.", "success": False}), 409

    # 6. 建立評論
    new_review = Review(
        customer_id=current_user_id,
        vendor_id=order.vendor_id, # 這裡沒問題，Model 裡有 vendor_id
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
                "customer_id": new_review.customer_id,
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
        print(f"Error posting review: {e}") 
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500