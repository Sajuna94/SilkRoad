from flask import Blueprint
# from controllers import shop_controller   #WIP
from controllers import register_vendor

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

vendor_routes.route("/login", methods)
