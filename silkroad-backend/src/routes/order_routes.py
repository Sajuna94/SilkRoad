from controllers import trans_to_order
from flask import Blueprint

order_routes = Blueprint("order", __name__)

order_routes.route('/trans', methods=['POST'])(trans_to_order)