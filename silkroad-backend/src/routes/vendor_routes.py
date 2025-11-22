from flask import Blueprint
# from controllers import shop_controller   #WIP
from controllers import register_vendor, login_vendor, logout_vendor

vendor_routes = Blueprint('shop', __name__)

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

return (if success)
{
    "message": "Vendor registered successfully",
    "status": "success"
}

return (if failure)
{
    "message": "Vendor registration failed",
    "status": "failure"
}
"""
vendor_routes.route("/register", methods=["POST"])(register_vendor)

"""
function:
    login vendor

expected get:
{
    email: "string",
    password: "string"
}

return:(if success)
{
    "message": "Vendor logged in successfully",
    "status": "success"
}

return (if failure)
{
    "message": "Vendor login failed",
    "status": "failure"
    reason: "email or password is incorrect / email not found"
}

Note: reason欄位只有失敗才有，可能回傳
"email or password is incorrect"
"email not found"
"""
vendor_routes.route("/login", methods=["POST"])(login_vendor)

"""
function:
    logout vendor

expected get:
{
    email: "string",
    password: "string"
}

return:
{
    "message": "Vendor logged out successfully",
    "status": "success"
}
"""
vendor_routes.route("/logout", methods=["POST"])(logout_vendor)
