from flask import Blueprint
from controllers.user_controller import (
    register_user, 
    login_user, 
    logout_user, 
    update_user, 
    update_password, 
    delete_user
)

user_routes = Blueprint('user', __name__)

user_routes.route('/register', methods=['POST'])(register_user)
"""
User registration
expect:
if role == 'vendor' :
{
    "role" = string,
    "name" = string,
    "email" = string,
    "password" = string,
    "phone_number" = string
    "vendor_manager_id"= int,
    "is_active"=bool
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
    "success": False
}
"""

user_routes.route('/logout', methods=['POST'])(logout_user)
"""
User logout
expect: 
nothing...?

return:
{
    "message": "Logout successful",
    "success": True
}
"""

user_routes.route('/update/<int:user_id>', methods=['PUT'])(update_user)
"""
Update User Profile (excluding password)
expect:
{
    "name": string (optional),
    "phone_number": string (optional),
    "address": string (optional, valid for vendor/customer only)
}

return:
{
    "data": {
        "address": if admin: null 
                   else: string,
        "email": string,
        "id": int,
        "name": string,
        "phone_number": string,
        "role": string
    },
    "message": "User profile updated successfully",
    "success": True,
}
else:
{
    "message": "...",
    "success": False
}
"""

user_routes.route('/update_password/<int:user_id>', methods=['PUT'])(update_password)
"""
Update User Password
expect:
{
    "old_password": string,
    "new_password": string
}

return:
{
    "message": "Password updated successfully",
    "success": True
}
else:
{
    "message": "...",
    "success": False
}
"""

user_routes.route('/delete/<int:user_id>', methods=['DELETE'])(delete_user)
"""
Delete User
expect:
(None, uses URL parameter)

return:
{
    "message": "User deleted successfully",
    "success": True
}
else:
{
    "message": "...",
    "success": False
}
"""