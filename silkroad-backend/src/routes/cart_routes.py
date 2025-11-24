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

    # 可能會回傳:
    #        {
    #        "message": "...",
    #        "success": True/False
    #        }

cart_routes.route('/remove', methods=['POST'])(remove_from_cart)

    #     需要{
    #     " cart_item_id":XXX,
    #     "customer_id":XXX,
    #     }

    # 可能會回傳:
    #        {
    #        "message": "...",
    #        "success": True/False
    #        }    

cart_routes.route('/view', methods=['POST'])(view_cart)
    #     需要{
    #     "customer_id":XXX,
    #     "vendor_id":XXX,
    #     }

    # 可能會回傳:
    #       ---空購物車---
    #       {
    #        "data": [],
    #        "message": "cart is empty",
    #        "success": True,                           
    #        "total_amount": 0
    #       }
    #
    # 或     ---vendor_id 衝突錯誤---
    #       {
    #       "message": "購物車跨店購物。",
    #       "success": False
    #       }
    #
    # 或    ---成功回傳---
    #       {
<<<<<<< HEAD
    #       "status": "success",
    #       "customer_id": customer_id,
    #       "vendor_id": current_cart.vendor_id,
    #       "items": result_list,     # result_list 格式請查看 silkroad-backend/src/controllers/cart_controller
    #       "total_amount": total_price
    #       }

    # 或 ---
    # { data {}, message: "" }
=======
    #       "data": [],
    #       "message": "cart item view",
    #       "success": True",
    #       
    #       }
>>>>>>> d06504e5b6ed80662780189d0170fee2216ff171
