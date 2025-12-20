from flask import Blueprint 
from controllers import post_vendor_review
customer_routes = Blueprint('customer', __name__)

customer_routes.route('/review', methods=['POST'])(post_vendor_review)
"""
Post a review for a completed order
Header: Cookie (session) required - Identifies the customer

Expect (Body):
{
    "order_id": int,          # The order to review
    "rating": int,            # 1-5
    "review_content": string  # optional
}

Return:
If Success:
{
    "success": true,
    "message": "Review posted successfully",
    "data": [{
        "review_id": int,
        "order_id": int,      # 新增回傳這個，方便前端對照
        "customer_id": int,   # 從 session 抓取的 ID
        "vendor_id": int,     # 從訂單反查出的店家 ID
        "rating": int,
        "content": string,
        "created_at": datetime
    }]
}

If Failure (e.g., Order not found, Not your order, Duplicate review):
{
    "success": false,
    "message": "..."
}
"""