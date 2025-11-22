from controllers import add_to_cart, remove_from_cart, view_cart
from flask import Blueprint

cart_routes = Blueprint("cart", __name__)


cart_routes.route('/add', methods=['POST'])(add_to_cart)
    #     需要{
    #     "customer_id":XXX,
    #     "vendor_id":XXX,
    #     "product_id":XXX,
    #     "quantity":XXX,
    #     "selected_sugar":XXX,
    #     "selected_ice":XXX,
    #     "selected_sizece":XXX
    #     }


#cart_routes.route('/remove', methods=['POST'])(remove_from_cart)

cart_routes.route('/view', methods=['POST'])(view_cart)
    #     需要{
    #     "customer_id":XXX,
    #     "vendor_id":XXX,
    #     }

    # 可能會回傳:
    #       ---空購物車---
    #       {
    #       "status": "empty",
    #       "message": "購物車是空的",
    #       "customer_id": customer_id,
    #       "vendor_id": request_vendor_id,
    #       "items": [],
    #        "total_amount": 0
    #       }
    #
    # 或     ---vendor_id 衝突錯誤---
    #       {
    #       "status": "conflict",
    #       "message": "購物車跨店購物。",
    #       "existing_vendor_id": current_cart.vendor_id,
    #       "current_vendor_id": request_vendor_id
    #       }
    #
    # 或    ---成功回傳---
    #       {
    #       "status": "success",
    #       "customer_id": customer_id,
    #       "vendor_id": current_cart.vendor_id,
    #       "items": result_list,     # result_list 格式請查看 silkroad-backend/src/controllers/cart_controller
    #       "total_amount": total_price
    #       }