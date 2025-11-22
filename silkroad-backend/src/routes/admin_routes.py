from flask import Blueprint
from controllers import block_user, post_announcement

admin_routes = Blueprint('admin', __name__)

admin_routes.route('/block', methods=['POST'])(block_user)
admin_routes.route('/announce', methods=['POST'])(post_announcement)