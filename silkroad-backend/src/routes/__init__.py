"""
package routes : 定義所有 API 路由 (Flask Blueprint)
"""

from routes.user_routes import user_routes
from routes.cart_routes import cart_routes
from routes.shop_routes import shop_routes

__all__ = ['user_routes', 'cart_routes', 'shop_routes']