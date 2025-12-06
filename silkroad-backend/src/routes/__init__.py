"""
package routes : 定義所有 API 路由 (Flask Blueprint)
"""

from routes.user_routes import user_routes
from routes.cart_routes import cart_routes
from routes.vendor_routes import vendor_routes
from routes.admin_routes import admin_routes
from routes.order_routes import order_routes
from routes.customer_routes import customer_routes

__all__ = [
    'user_routes',
    'cart_routes',
    'vendor_routes',
    'admin_routes',
    'order_routes',
    'customer_routes'
]
