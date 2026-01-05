from flask import Blueprint
from controllers import block_user, post_announcement, update_announcement, delete_announcement, unblock_user, get_all_customers, get_all_vendors, get_all_announcements, get_all_users, get_block_records

admin_routes = Blueprint('admin', __name__)

admin_routes.route('/block', methods=['POST'])(block_user)
"""
Admin block user (Vendor or Customer)
expect:
{
    "admin_id" = int,
    "target_user_id" = int,
    "reason" = string
}

return 
if success:
{
    "data": [{
        "target_user_id": int,
        "target_type": string,
        "status": "blocked",
        "reason": string
    }],
    "message": "...",
    "success": True
}
else:
{
    "message": "...",
    "success": False
}
"""

admin_routes.route('/unblock', methods=['POST'])(unblock_user)
"""
Admin unblock user (Restore status)
expect:
{
    "admin_id" = int,
    "target_user_id" = int
}

return 
if success:
{
    "data": [{
        "target_user_id": int,
        "target_type": string,
        "status": "active"
    }],
    "message": "...",
    "success": True
}
"""

admin_routes.route('/announce', methods=['POST'])(post_announcement)
"""
Admin post system announcement
expect:
{
    "admin_id" = int,
    "message" = "..."
}

return 
if success:
{
    "data": [{
        "announcement_id": int,
        "message": string,
        "created_at": datetime string
    }],
    "message": "...",
    "success": True
}
else:
{
    "message": "...",
    "success": False
}
"""

admin_routes.route('/announce/<int:announcement_id>', methods=['PUT'])(update_announcement)
"""
Update Announcement
expect:
{
    "admin_id": int,
    "message": string
}

return:
{
    "data": [{
        "announcement_id": int,
        "message": string
    }],
    "message": "Announcement updated successfully",
    "success": True
}
"""

admin_routes.route('/announce/<int:announcement_id>', methods=['DELETE'])(delete_announcement)
"""
Delete Announcement
expect:
{
    "admin_id": int
}

return:
{
    "message": "...",
    "success": True
}
"""

admin_routes.route('/customers', methods=['GET'])(get_all_customers)
"""
Return:
{
    "success": true,
    "message": "Retrieved all customers successfully",
    "data": [
        {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string,
            "address": string,
            "membership_level": int,
            "is_active": boolean,
            "created_at": string
        },
        {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string,
            "address": string,
            "membership_level": int,
            "is_active": boolean,
            "created_at": string
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
admin_routes.route('/vendors', methods=['GET'])(get_all_vendors)
"""
Return:
{
    "success": true,
    "message": "Retrieved all vendors successfully",
    "data": [
        {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string,
            "address": string,
            "vendor_manager_id": int,
            "is_active": boolean,
            "created_at": datetime
        },
        {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string,
            "address": string,
            "vendor_manager_id": int,
            "is_active": boolean,
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
admin_routes.route('/announcements', methods=['GET'])(get_all_announcements)
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

admin_routes.route('/users', methods=['GET'])(get_all_users)
"""
Get All Users (Admin, Vendor, Customer)
URL: /api/admin/users
Method: GET
Auth: Admin only

Return:
{
    "success": true,
    "message": "Retrieved all users successfully",
    "count": int,
    "data": [
        {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string,
            "role": string,  // "admin", "vendor", "customer"
            "created_at": string,
            "is_active": boolean or null  // null for Admin
        },
        ...
    ]
}
"""

admin_routes.route('/block-records', methods=['GET'])(get_block_records)
"""
Get All Block Records
URL: /api/admin/block-records
Method: GET
Auth: Admin only

Return:
{
    "success": true,
    "message": "Retrieved all block records successfully",
    "count": int,
    "data": [
        {
            "id": int,
            "admin_id": int,
            "target_user_id": int,
            "reason": string,
            "created_at": string
        },
        ...
    ]
}
"""
