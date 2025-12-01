from flask import Blueprint
from controllers import block_user, post_announcement, update_announcement, delete_announcement, unblock_user

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