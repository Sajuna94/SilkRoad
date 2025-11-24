from flask import Blueprint
from controllers import register_user, login_user, update_products

vendor_routes = Blueprint('vendor', __name__)

"""
function:
    register vendor

expected get:
{
    "name": "string",
    "email": "string",
    "password": "string",
    "phone_number": "string"
    "address": "string"
    "manager": {
        "name": "string",
        "email": "string",
        "phone_number": "string"
    }
}

return:
{
    "message": "...",
    "success": bool
}
"""
vendor_routes.route("/register", methods=["POST"])(register_user)

"""
function:
    login vendor

expected get:
{
    email: "string",
    password: "string"
}

return:
{
    "message": "...",
    "success": True/False
}
"""
vendor_routes.route("/login", methods=["POST"])(login_user)
"""
function:
    更新product(s)狀態

expected get:
[
    {
        "product_id": "int",
        "behavior": {
            "col_name": "string",
            "value": "string"
        }
    },
    ...
]

return:
{
    "message": "...",
    "success": True/False
}
Note:
col_name欄位只接受
name, price(Integer), description, image_url, is_listed(true/false)
這個function會根據指定的col做調整，因此value 應該為string
"""
# WIP
vendor_routes.route("/update_products", methods=["POST"])(update_products)
