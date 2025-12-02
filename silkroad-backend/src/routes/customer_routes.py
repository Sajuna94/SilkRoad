from flask import Blueprint 
from controllers import post_vendor_review
customer_routes = Blueprint('customer', __name__)

customer_routes.route('/review', methods=['POST'])(post_vendor_review)
"""
Post a review for a vendor
Header: Cookie (session) required
Expect:
{
    "customer_id": int,
    "vendor_id": int,
    "rating": int (1-5),
    "review_content": string (optional)
}
Return:
{
    "success": true,
    "message": "Review posted successfully",
    "data":{
        "review_id": int,
        "customer_id": int,
        "vendor_id": int,
        "rating": int,
        "content": string,
        "created_at": datetime
     }
}
else:
{
    "success": false,
    "message": "..."
}
"""