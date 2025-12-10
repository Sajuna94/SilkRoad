from flask import jsonify, request
from config import db
from models import Cart_Item, Cart, Order, Order_Item, Discount_Policy, Customer
from datetime import date

def do_discount(total_price_accumulated, policy_id, user_id):

    if not policy_id:
        return total_price_accumulated

    discount = Discount_Policy.query.get(policy_id)
    if not discount:
        raise ValueError("無效的折價券 ID")
    
    customer = Customer.query.get(user_id)
    if not customer:
        raise ValueError("找不到該顧客資訊，無法驗證會員等級")
    
    membership_level = customer.membership_level

    today = date.today()

    if discount.is_available == False:
        raise ValueError("折價券已停用")
    
    if discount.start_date and discount.start_date > today:
        raise ValueError(f"折價券尚未生效，請於 {discount.start_date.isoformat()} 後使用")
    
    if discount.expiry_date and discount.expiry_date < today:
         raise ValueError("折價券已過期")

    if membership_level < discount.membership_limit:
            raise ValueError("會員資格不符")

    if discount.min_purchase and total_price_accumulated < discount.min_purchase:
        raise ValueError(f"未達折價券低消限制 (${discount.min_purchase})")
    
    discount_amount = 0
    
    if str(discount.type) == 'percent':
        discount_amount = total_price_accumulated - (total_price_accumulated * discount.value)
    elif str(discount.type) == 'fixed':
        discount_amount = discount.value
    
    if discount.max_discount is not None:
        if discount_amount > discount.max_discount:
            discount_amount = discount.max_discount

    final_price = total_price_accumulated - discount_amount
    return max(final_price, 0)


def generate_new_order(cart, policy_id, note, payment_methods):
    user_id = cart.customer_id
    vendor_id = cart.vendor_id
    total_price_accumulated = 0
    
    try:
        new_order = Order(
            user_id = user_id,
            vendor_id = vendor_id,
            policy_id = policy_id,
            total_price =0,
            discount_amount = 0,
            note = note,
            payment_methods = payment_methods,
            refund_status = None,
            refund_at = None,
            is_completed = False,
            is_delivered = False,
        )
        
        db.session.add(new_order)
        db.session.flush()

        for item in cart.items:
                item_price = store_and_calculate_item(new_order, item)
                total_price_accumulated += item_price

        final_price = do_discount(total_price_accumulated, policy_id, user_id)
        new_order.total_price = final_price

        discount_applied = total_price_accumulated - final_price
        new_order.discount_amount = discount_applied

        db.session.delete(cart) 
        db.session.commit()
        return jsonify({
                        "order_id": new_order.id,
                        "total_amount": new_order.total_price,
                        "message": "訂單建立成功且已結帳",                  
                        "success": True
                        }), 201
    
    except ValueError as ve:
        db.session.rollback()
        return jsonify({"message": str(ve), "success": False}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"系統錯誤，訂單建立失敗: {str(e)}", 
                        "success": False
                       }), 500

def store_and_calculate_item(new_order, item):
    product = item.product
    if not product:
        raise ValueError(f"project ID {item.product_id} do not exist。")

    unit_price = product.price
    items_price = unit_price * item.quantity 
    
    new_order_item = Order_Item(
        order_id = new_order.id,
        product_id = item.product_id,
        quantity = item.quantity,
        price = unit_price,
        selected_sugar = item.selected_sugar,
        selected_ice = item.selected_ice,
        selected_size = item.selected_size,
    )
    db.session.add(new_order_item)
    
    return items_price


def trans_to_order():
    data = request.get_json()
    """
    預計傳給我{
    "customer_id":XXX,
    "vendor_id":XXX,
    "policy_id":XXX,
    "note":XXX,
    "payment_methods":XXX,
    }
    """

    if not data:
        return jsonify({'message': '無效的請求數據',
                        "success": False}), 400
    
    customer_id = data.get("customer_id")
    vendor_id = data.get("vendor_id")

    if not customer_id or not vendor_id:
        return jsonify({"message": "缺少 customer_id 或 vendor_id ",
                        "success": False}), 400   
    
    cart = Cart.query.get(customer_id)

    if not cart:
        return jsonify({"message": "購物車中沒有商品",
                        "success": False}), 404
    
    if vendor_id != cart.vendor_id:
        return jsonify({"message": "vendor_id 不符合",
                        "success": False}), 400
    
    policy_id = data.get("policy_id")
    note = data.get("note")
    payment_methods = data.get("payment_methods")
    
    return generate_new_order(cart, policy_id, note, payment_methods)

def view_order():
    data = request.get_json()
    """
    預計傳給我{
    "order_id":XXX,
    "user_id":XXX,
    "vendor_id":XXX,
    }
    """

    if not data:
        return jsonify({'message': '無效的請求數據',
                        "success": False}), 400
    
    order_id = data.get("order_id")
    request_user_id = data.get("user_id")
    request_vendor_id = data.get("vendor_id")

    if not order_id or not request_user_id or not request_vendor_id:
        return jsonify({"message": "缺少 order_id 或 user_id 或 vendor_id"}), 400
    
    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({"message": "查無訂單",
                            "success": False}), 400
        if order.user_id != request_user_id or order.vendor_id != request_vendor_id:
            return jsonify({"message": "user_id 或 vendor_id 不匹配",
                            "success": False}), 400
        
        order_items = order.items

        result_list = []
        total_price = 0

        for item in order_items:
            product = item.product
            
            item_sub_price = item.price * item.quantity
            if product:
                
                total_price += item_sub_price

                result_list.append({
                    "order_item_id": item.id,
                    "order_id": item.order_id,
                    "product_id": item.product_id,
                    "product_name": product.name,
                    "product_image": product.image_url,

                    "price": item.price,
                    "quantity": item.quantity,
                    "subtotal": item_sub_price,

                    "selected_sugar": item.selected_sugar,
                    "selected_ice": item.selected_ice,
                    "selected_size": item.selected_size
                })

        order_info = ({
            "note": order.note,
            "payment_methods": order.payment_methods,
            "refund_status": order.refund_status,
            "refund_at": order.refund_at,
            "is_completed": order.is_completed,
            "is_delivered": order.is_delivered,
            "total_price": order.total_price
        })
        
        return jsonify({
            "data": result_list,
            "order_info": order_info,            
            "message": "order items view",
            "success": True,         
        })       
    except Exception as e:
        print(f"Error details: {e}")
        return jsonify({'message': '系統錯誤', 'error': str(e)}), 500

def update_orderinfo():
    data = request.get_json()

    """
    預計傳給我{
    "order_id": XXX,
    "refund_status":XXX,
    "refund_at":XXX,
    "is_completed":XXX,
    "is_delivered":XXX
    }
    """

    order_id = data.get('order_id')
    if not order_id:
        return jsonify({"message": "order_id為空",
                        "success": False}), 400
    
    order = Order.query.filter_by(id=order_id).first()
    if not order:
        return jsonify({"message": f"找不到 ID 為 {order_id} 的訂單",
                        "success": False}), 404
    
    refund_status = data.get("refund_status")
    refund_at = data.get("refund_at")
    is_completed = data.get("is_completed")
    is_delivered = data.get("is_delivered")

    able_refund_status = ['refunded', 'rejected', None]

    try:
        if refund_status is not None:
            if refund_status not in able_refund_status:
                return jsonify({"message": "refund_status 傳值錯誤",
                                "success": False}), 400
            order.refund_status = refund_status
        
        if refund_status == "refunded":
            if refund_at is None:
                return jsonify({"message": "refund_at 傳值錯誤",
                                "success": False}), 400
            order.refund_at = refund_at
        elif refund_status != 'refunded' and refund_at is not None:
             return jsonify({"message": "refund_status 不為 'refunded'",
                             "success": False}), 400
        elif refund_status in [None, 'rejected'] and refund_at is None:
            order.refund_at = None

        if is_completed is not None:
            if not isinstance(is_completed, bool):
                return jsonify({"message": "is_completed 必須是bool",
                                "success": False}), 400
            
            order.is_completed = is_completed

        if is_delivered is not None:
            if not isinstance(is_delivered, bool):
                return jsonify({"message": "is_delivered 傳值錯誤",
                                "success": False}), 400
            order.is_delivered = is_delivered

        db.session.commit()
        return jsonify({"message": "訂單資訊更新成功",
                        "success": True}), 200

        
    except Exception as e:
        db.session.rollback()
        print(f"更新訂單時發生錯誤: {e}")
        return jsonify({"message": "伺服器內部錯誤", "success": False}), 500
