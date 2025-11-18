from controllers import add_to_cart, remove_from_cart, view_cart
from flask import Blueprint

cart_routes = Blueprint("cart", __name__)


cart_routes.route('/add', methods=['GET'])(add_to_cart) # 記得改回POST
cart_routes.route('/remove', methods=['GET'])(remove_from_cart) # 記得改回POST
cart_routes.route('/view', methods=['GET'])(view_cart)