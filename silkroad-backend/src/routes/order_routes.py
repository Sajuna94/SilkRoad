from controllers import trans_to_order, view_order, update_orderinfo
from flask import Blueprint

order_routes = Blueprint("order", __name__)

order_routes.route('/trans', methods=['POST'])(trans_to_order)

    #     需要{
    #     "customer_id":XXX,
    #     "vendor_id":XXX,
    #     "policy_id":XXX,
    #     "note":XXX,
    #     "payment_methods":XXX,
    #     }

        # 可能會回傳:
    #        {
    #        "message": "...",
    #        "success": True/False
    #        }   

order_routes.route('/view', methods=['POST'])(view_order)

    #     預計傳給我{
    #     "order_id":XXX,
    #     "user_id":XXX,
    #     "vendor_id":XXX,
    #     }

        # 錯誤時回傳:
    #        {
    #        "message": "...",
    #        "success":False
    #        }  

    # ---------------------------------------------------------- 
    # ----------------------------------------------------------
        # 成功時回傳
    #        {
    #        "data": result_list,
    #        "order_info": order_info,            
    #        "message": "order items view",
    #        "success": True,         
    #        }
    #
        #   order_info包含
    #        {
    #        "note": order.note,
    #        "payment_methods": order.payment_methods,
    #        "refund_status": order.refund_status,
    #        "refund_at": order.refund_at, 格式： YYYY-MM-DD HH:mm:ss
    #        "is_completed": order.is_completed,
    #        "is_delivered": order.is_delivered,
    #        "total_price": order.total_price
    #        }
    #
        #   data包含
    #        {
    #        "discount_amount": order.discount_amount,
    #        "order_item_id": item.id,
    #        "order_id": item.order_id,
    #        "product_id": item.product_id,
    #        "product_name": product.name,
    #        "product_image": product.image_url,

    #        "price": item.price,
    #        "quantity": item.quantity,
    #        "subtotal": item_sub_price,

    #        "selected_sugar": item.selected_sugar,
    #        "selected_ice": item.selected_ice,
    #        "selected_size": item.selected_size
    #         }

order_routes.route('/update', methods=['POST'])(update_orderinfo)

    #     需要{
    #     "order_id": int,
    #     "refund_status": ENUM(str),
    #     "refund_at": timestamp(str),
    #     "is_completed": boolean ,
    #     "is_delivered": boolean
    #     }


        #   order_info包含
    #        {
    #        "note": order.note,
    #        "payment_methods": order.payment_methods,
    #        "refund_status": order.refund_status,
    #        "refund_at": order.refund_at, 格式： YYYY-MM-DD HH:mm:ss
    #        "is_completed": order.is_completed,
    #        "is_delivered": order.is_delivered,
    #        "total_price": order.total_price
    #        }
    #
        #   data包含
    #        {
    #        "discount_amount": order.discount_amount,
    #        "order_item_id": item.id,
    #        "order_id": item.order_id,
    #        "product_id": item.product_id,
    #        "product_name": product.name,
    #        "product_image": product.image_url,

    #        "price": item.price,
    #        "quantity": item.quantity,
    #        "subtotal": item_sub_price,

    #        "selected_sugar": item.selected_sugar,
    #        "selected_ice": item.selected_ice,
    #        "selected_size": item.selected_size
    #         } 
