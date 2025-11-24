from flask import Blueprint
from controllers import register_user, login_user, update_products, add_product

vendor_routes = Blueprint('vendor', __name__)

"""
function:
    增加product
    
expected get:
{
    "vendor_id": int,
    "name": string,
    "price": int,
    "description": string,
    "image_url": string,
    "is_listed": bool (default=True)
}
return:
{
    "message": "...",
    "success": bool
    "product_id": int (is successful)
}
"""
vendor_routes.route("/Add_Product", methods=["POST"])(add_product)

"""
function:
    更新product(s)狀態

expected get:
[
    {
        "product_id": int,
        "behavior": {
            "col_name": string,
            "value": string
        }
    },
    ...
]

return:
{
    "message": "...",
    "success": bool,
    "product": { (if successful)
        "vendor_id": int,
        "name": string,
        "price": int,
        "description": string,
        "image_url": string,
        "is_listed": bool 
    }
}
Note:
col_name欄位只接受
name, price(Integer), description, image_url, is_listed(true/false)
這個function會根據指定的col做調整，因此value 應該為string
"""
vendor_routes.route("/update_products", methods=["POST"])(update_products) #WIP same vendor check
