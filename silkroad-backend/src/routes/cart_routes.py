from controllers import add_to_cart, remove_from_cart, view_cart
from flask import Blueprint

cart_routes = Blueprint("cart", __name__)


cart_routes.route('/add', methods=['POST'])(add_to_cart)
#cart_routes.route('/remove', methods=['POST'])(remove_from_cart)
#cart_routes.route('/view', methods=['GET'])(view_cart)