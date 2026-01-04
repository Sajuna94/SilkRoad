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
    get_all_announcements,
    get_vendor_ids,
    topup_balance,
    get_vendor_reviews,
    verify_email,
    resend_verification_code
)

user_routes = Blueprint('user', __name__)

user_routes.route('/verify-email', methods=['POST'])(verify_email)
user_routes.route('/resend-code', methods=['POST'])(resend_verification_code)

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
    "description": string,
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
        "is_active": boolean,
        "description": string
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
        "description": string,
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
        "description": string,
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

user_routes.route('/announcements', methods=['GET'])(get_all_announcements)
"""
Return:
{
    "success": true,
    "message": "Retrieved all announcements successfully",
    "data": [
        {
            "announcement_id": int,
            "admin_id": int,
            "message": string,
            "created_at": datetime
        },
        {
            "announcement_id": int,
            "admin_id": int,
            "message": string,
            "created_at": datetime
        },
        if more...
    ]
}
else:
{
    "message": "...",
    "success": False
}
"""

user_routes.route('/vendors/ids', methods=['GET'])(get_vendor_ids)
"""
Get all available vendor IDs (for general users)
No authentication required

Return:
{
    "success": true,
    "message": "Retrieved vendor IDs successfully",
    "data": [1, 2, 3, 4, 5]  # Array of vendor IDs
}

else:
{
    "message": "Database error: ...",
    "success": false
}
"""


user_routes.route('/topup', methods=['POST'])(topup_balance)
"""
Customer Top-up Balance
URL: /api/user/topup
Method: POST
Headers: Cookie (Session required, Role: 'customer')

Expect:
{
    "amount": int (1 - 999999)
}

Return (Success):
{
    "success": true,
    "message": "儲值成功",
    "data": {
        "new_balance": int,
        "added_amount": int
    }
}

Return (Failure):
{
    "message": "...",
    "success": false
}
"""

user_routes.route('/vendor/<int:vendor_id>/reviews', methods=['GET'])(get_vendor_reviews)
"""
Get Vendor Reviews
URL: /api/user/vendor/<int:vendor_id>/reviews
Method: GET
Auth: None (Public)

Return:
{
    "success": true,
    "message": string,
    "data": [{
            "review_id": int,
            "rating": int,
            "order_id": int,
            "content": string,
            "created_at": datetime
    }]
}
else:
{
    "message": "...",
    "success": false
}
"""