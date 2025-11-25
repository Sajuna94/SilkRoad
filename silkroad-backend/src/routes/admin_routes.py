from flask import Blueprint
from controllers import block_user, post_announcement

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
    "message": "Successfully blocked Vendor",
    "success": True
}
else:
{
    "message": "...",
    "success": False
}
"""

admin_routes.route('/announce', methods=['POST'])(post_announcement)
"""
Admin post system announcement
expect:
{
    "admin_id" = int,
    "message" = string
}

return 
if success:
{
    "success": True,
    "message": "Announcement posted successfully",
    "data": [{
        "announcement_id": int,
        "message": string,
        "created_at": datetime string
    }]
}
else:
{
    "message": "...",
    "success": False
}
"""