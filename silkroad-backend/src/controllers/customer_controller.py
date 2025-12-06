#by Fan
from flask import request, jsonify
from models import Customer
from models.store.review import Review
from models.auth.vendor import Vendor
from models.auth.customer import Customer
from config import db
from utils import require_login

@require_login(role=["customer"])
def post_vendor_review():
    """
    顧客評論店家
    """
    data = request.get_json()
    
    customer_id = data.get('customer_id')
    vendor_id = data.get('vendor_id')
    rating = data.get('rating')
    review_content = data.get('review_content')

    # 1. 檢查必要欄位
    if not all([customer_id, vendor_id, rating]):
        return jsonify({
            "message": "Missing customer_id, vendor_id or rating",
            "success": False
        }), 400

    # 2. 驗證評分範圍 (1-5)
    try:
        rating = int(rating)
        if not (1 <= rating <= 5):
            raise ValueError
    except ValueError:
        return jsonify({
            "message": "Rating must be an integer between 1 and 5",
            "success": False
        }), 400

    # 3. 確認該 ID 是否為 Customer
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({
            "message": "User not found or is not a customer",
            "success": False
        }), 404

    # 4. 確認店家存在
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({
            "message": "Vendor not found",
            "success": False
        }), 404

    # 5. 檢查是否已經評論過該店家 (Unique Constraint Check)
    existing_review = Review.query.filter_by(
        customer_id=customer_id, 
        vendor_id=vendor_id
    ).first()

    if existing_review:
        return jsonify({
            "message": "You have already reviewed this vendor.",
            "success": False
        }), 409

    # 6. 建立評論
    new_review = Review(
        customer_id=customer_id,
        vendor_id=vendor_id,
        rating=rating,
        review_content=review_content
    )

    try:
        db.session.add(new_review)
        db.session.commit()

        return jsonify({
            "data": [{
                "review_id": new_review.id,
                "customer_id": new_review.customer_id, # 回傳確認一下
                "vendor_id": new_review.vendor_id,
                "rating": new_review.rating,
                "content": new_review.review_content,
                "created_at": new_review.created_at
            }],
            "message": "Review posted successfully",
            "success": True
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500