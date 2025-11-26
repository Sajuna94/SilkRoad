from flask import Blueprint
from controllers import update_products, add_product, get_vendor_products

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
}        "vendor_id": int
Note:
col_name欄位只接受
name, price(Integer), description, image_url, is_listed(true/false)
這個function會根據指定的col做調整，因此value 應該為string
"""

vendor_routes.route("/update_products", methods=["PATCH"])(update_products) #WIP same vendor check

"""
function:
    獲得vendor中所有products狀態

return:
{
    "message": String,
    "success": bool,
    "products": [ (if successful)
        {
            "id": int,
            "name": string,
            "price": int,
            "description": string,
            "image_url": string,
            "is_listed": bool 
        },
        ...
    ]
}

"""
vendor_routes.route("/<int:vendor_id>/get_products", methods=["GET"])(get_vendor_products)
"""
function:
    移除products

expected get:
[
    {
        "product_id": int,
    },
    ...
]

return:
{
    "message": String,
    "success": bool,
    "products": [ (if successful)
        {
            "id": int,
            "name": string,
            "price": int,
            "description": string,
            "image_url": string,
            "is_listed": bool 
        },
        ...
    ]
}

"""
# vendor_routes.route("/remove_products", methods=["DELETE"])(remove_products)
