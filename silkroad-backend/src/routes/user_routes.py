from flask import Blueprint
from controllers import register_user, login_user

user_routes = Blueprint('user', __name__)

user_routes.route('/register', methods=['POST'])(register_user)
"""
User registration
expect:
if role == 'vendor' :
{
    "role": string,
    "name": string,
    "email": string,
    "password": string,
    "phone_number": string
    "vendor_manager_id": int,
    "address"" string
    "is_active": bool, (default = true)
    "manager": {
        "name": string,
        "email": string,
        "phone_number": string
    }
}
elif role == 'customer' :
{
    "role" = string,
    "name" = string,
    "email" = string,
    "password" = string,
    "phone_number" = string
    "address"=string
}
elif role == 'admin' :
{
    "role" = string,
    "name" = string,
    "email" = string,
    "password" = string,
    "phone_number" = string

return 
{
    "message": "...",
    "success": bool,
    "user_id": int (if successful)
}
"""
user_routes.route('/login', methods=['POST'])(login_user)
"""
User login
expect:
{
    "email" = string,
    "password" = string
}

return 
if success:
{
    "data": {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone_number": user.phone_number
    },
    "message": "Login successful",
    "success": True
}
else:
{
    "message": "...",
    "success": bool
}
"""