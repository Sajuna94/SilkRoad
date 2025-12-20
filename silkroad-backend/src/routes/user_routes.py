from flask import Blueprint
from controllers.user_controller import (
    login_user, 
    logout_user, 
    update_user, 
    update_password, 
    delete_user,
    register_step1, 
    register_step2,
    current_user,
)

user_routes = Blueprint('user', __name__)

user_routes.route('/register/guest', methods=['POST'])(register_step1)
"""
Step 1 Registration: Validate common info & cache in session
expect:
{
    "role" = string ("vendor", "customer"),
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
user_routes.route('/register/<string:role>', methods=['POST'])(register_step2)
"""
Step 2 Registration: Role-specific info & DB commit
** Requires Session Cookie from Step 1 **

expect (If Role is Vendor):
{
    "name": string,
    "address": string,
    "manager": {
        "name": string,
        "email": string,
        "phone_number": string
    }
}

expect (If Role is Customer):
{
    "name": string,
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
User login with role-specific data response
expect:
{
    "email": string,
    "password": string
}

return:
if success (Customer):
{
    "success": True,
    "message": "Login successful",
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
    "message": "Login successful",
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
    "message": "Email or password is incorrect",
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

user_routes.route('/me', methods=['PATCH'])(update_user)
"""
Update Current User Profile
URL: /api/user/me
Method: PATCH
Headers: Cookie (Session User ID)

Expect (Body):
{
    "name": string (optional),
    "phone_number": string (optional),
    "address": string (optional)
}

Return:

If Success (Customer):
{
    "success": True,
    "message": "User profile updated successfully",
    "data": [{
        "id": int,
        "role": "customer",
        "name": string,
        "email": string,
        "phone_number": string,
        "created_at": datetime,
        "address": string,
        "membership_level": int,
        "is_active": boolean
    }]
}

If Success (Vendor):
{
    "success": True,
    "message": "User profile updated successfully",
    "data": [{
        "id": int,
        "role": "vendor",
        "name": string,
        "email": string,
        "phone_number": string,
        "created_at": datetime,
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

If Failure:
{
    "message": "...",
    "success": False
}
"""

user_routes.route('/me/password', methods=['PATCH'])(update_password)

"""
Update Current User Password
URL: /api/user/me/password
Method: PATCH
Headers: Cookie (Session ID)

Expect:
{
    "old_password": "old_pass",
    "new_password": "new_pass"
}

Return:
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

user_routes.route('/current_user', methods=['GET'])(current_user)
