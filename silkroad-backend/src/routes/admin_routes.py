from flask import Blueprint
from controllers import block_user, post_announcement

admin_routes = Blueprint('admin', __name__)

admin_routes.route('/block', methods=['POST'])(block_user)
"""
Admin 封鎖使用者 (Vendor 或 Customer)
範例:
{
    "admin_id": XXX,
    "target_user_id": XXX,
    "reason": "XXX"
}
return
{
    "message": "已成功封鎖 {XXX}",
    "target_user_id": XXX,
    "status": "XXX"
}
"""
admin_routes.route('/announce', methods=['POST'])(post_announcement)
"""
Admin 發布系統公告
範例:
{
    "admin_id": XXX,
    "message": "XXX"
}
return
{
    "message": "公告發布成功", 
    "announcement_id": XXX
}
"""
