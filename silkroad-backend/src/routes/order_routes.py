from controllers import trans_to_order, view_order, update_orderinfo, view_all_user_orders, view_all_vendor_orders,check_order_review_status
from flask import Blueprint

order_routes = Blueprint("order", __name__)

order_routes.route('/trans', methods=['POST'])(trans_to_order)

    #     需要{
    #     "customer_id":int,
    #     "vendor_id":int,
    #     "policy_id":int,
    #     "note":text(str),
    #     "payment_methods":enum(str),
    #     "is_delivered":boolean,
    #     "shipping_address":string (外送時必填)
    #     }

        # 可能會回傳:
    #        {
    #        "message": "...",
    #        "success": True/False
    #        }   

order_routes.route('/view', methods=['POST'])(view_order)

    #     預計傳給我{
    #     "order_id":int,
    #     "user_id":int,
    #     "vendor_id":int (optional),
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
    #        "total_price": order.total_price,
    #        "address_info": order.address_info
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

order_routes.route('/view_user_orders', methods=['POST'])(view_all_user_orders)

"""
需要 { "user_id": int }

回傳
jsonify({
            "data": result_list,
            "message": "成功取得所有訂單",
            "success": True,
        })
result_list 包含一個或多個
{
    "order_id": order.id, (int)
    "vendor_id": order.vendor_id, (int)
    "total_price": order.total_price, (int)
    "discount_amount": order.discount_amount, (int)
    "is_completed": order.is_completed, (boolean)
    "is_delivered": order.is_delivered, (boolean)
    "payment_methods": str(order.payment_methods), (ENUM(str))
    "created_at": order.created_at.strftime('%Y-%m-%d %H:%M:%S') if hasattr(order, 'created_at') else None, (timestamp(str))
    "note": order.note (text(str)),
    "address_info": order.address_info (str)
}
"""

order_routes.route('/view_vendor_orders', methods=['POST'])(view_all_vendor_orders)

"""
需要 { "vendor_id": int }

回傳
jsonify({
            "data": result_list,
            "message": "成功取得 vendor 所有訂單與細項",
            "success": True,
        })
result_list 包含一個或多個
{
    "order_id": order.id, (int)
    "user_id": order.user_id, (int)
    "total_price": order.total_price, (int)
    "discount_amount": order.discount_amount, (int)
    "is_completed": order.is_completed, (boolean)
    "is_delivered": order.is_delivered, (boolean)
    "refund_status": str(order.refund_status) if order.refund_status else None, (ENUM(str))
    "payment_methods": str(order.payment_methods), (ENUM(str))
    "refund_status": str(order.refund_status) if order.refund_status else None, (ENUM(str))
    "note": order.note, (text(str))
    "address_info": order.address_info (str)
    "created_at": order.created_at.strftime('%Y-%m-%d %H:%M:%S'), (timestamp(str))
    "items": [
        {
            "order_item_id": item.id, (int)
            "product_id": item.product_id, (int)
            "product_name": product.name, (str)
            "product_image": product.image_url, (str)
            "price": item.price, (int)
            "quantity": item.quantity, (int)
            "subtotal": item.price * item.quantity, (int)
            "selected_sugar": item.selected_sugar, (str)
            "selected_ice": item.selected_ice, (str)
            "selected_size": item.selected_size (str)
        }
    ]
}
"""
order_routes.route('/check_review', methods=['POST'])(check_order_review_status)
"""
if success:
    return {
        "success": True,
        "message": "查詢成功",
        "has_reviewed": is_reviewed, # True 代表已評論，False 代表未評論
        "data": review_data
    }
else:
    return {
        "success": False,
        "message": "找不到該訂單",
    }
"""