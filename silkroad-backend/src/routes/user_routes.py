from flask import Blueprint
from controllers.user_controller import (
    login_user, 
    logout_user, 
    update_user, 
    update_password, 
    delete_user,
    register_step1, 
    register_step2
)

user_routes = Blueprint('user', __name__)

user_routes.route('/register/step1', methods=['POST'])(register_step1)
"""
Step 1 Registration: Validate common info & cache in session
expect:
{
    "role" = string ("vendor", "customer"),
    "name" = string,
    "email" = string,
    "password" = string,
    "phone_number" = string
}

return 
if success:
{
    "message": "Step 1 passed. Please proceed to Step 2...",
    "success": True,
}
else:
{
    "message": "...",
    "success": False
}
"""
user_routes.route('/register/step2', methods=['POST'])(register_step2)
"""
Step 2 Registration: Role-specific info & DB commit
** Requires Session Cookie from Step 1 **

expect (If Role is Vendor):
{
    "address": string,
    "manager": {
        "name": string,
        "email": string,
        "phone_number": string
    }
}

expect (If Role is Customer):
{
    "address": string
}

return 
if success (Customer):
{
    "success": True,
    "message": "Registration successful",
    "data": [{
        "id": int,
        "role": "customer",
        "name": string,
        "email": string,
        "phone_number": string,
        "address": string,
        "membership_level": int,
        "is_active": boolean
    }]
}

if success (Vendor):
{
    "success": True,
    "message": "Registration successful",
    "data": [{
        "id": int,
        "role": "vendor",
        "name": string,
        "email": string,
        "phone_number": string,
        "address": string,
        "is_active": boolean,
        "manager": {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string
        }
    }]
}
else:
{
    "message": "...",
    "success": False
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
