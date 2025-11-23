from flask import jsonify, request
from config import db
from models import Cart_Item
from models import Cart
from models import Order
from models import Order_Item
from models import Discount_Policy
from datetime import date
def do_discount(total_price_accumulated, policy_id):

    discount = Discount_Policy.query.get(policy_id)

    vendor_id = discount.vendor_id
    type = discount.type
    value = discount.value
    membership_limit = discount.membership_limit
    # created_at = discount.created_at
    # updated_at = discount.updated_at

    if (discount.min_purchase and (total_price_accumulated < discount.min_purchase)):   
        return jsonify({"message": "折價券未達低消",
                        "success": False
                        }), 400
    
    today = date.today()
    if (discount.expiry_date and (discount.expiry_date < today)):
        return jsonify({"message": "折價券過期",
                        "success": False
                        }), 400

    if (type == 'percent'):
        after_discount_price = total_price_accumulated * value / 100             
    elif (type == 'fixed'):
        after_discount_price = total_price_accumulated - value

    if (discount.max_discount != None):
        if (total_price_accumulated - after_discount_price > discount.max_discount):
                after_discount_price = total_price_accumulated - discount.max_discount
     
    return after_discount_price


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

        new_order.total_price = do_discount(total_price_accumulated, policy_id)

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

    temp_price = product.price
    items_price = temp_price * item.quantity 
    
    new_order_item = Order_Item(
        order_id = new_order.id,
        product_id = item.product_id,
        quantity = item.quantity,
        selected_sugar = item.selected_sugar,
        selected_ice = item.selected_ice,
        selected_size = item.selected_size,
    )
    db.session.add(new_order_item)
    
    return items_price


def trans_to_order():
    data = request.get_json()

    #     預計傳給我{
    #     "customer_id":XXX,
    #     "vendor_id":XXX,
    #     "policy_id":XXX,
    #     "note":XXX,
    #     "payment_methods":XXX,
    #     }

    if not data:
        return jsonify({'message': '無效的請求數據'}), 400
    
    customer_id = data.get("customer_id")
    vendor_id = data.get("vendor_id")

    if not customer_id or not vendor_id:
        return jsonify({"message": "缺少 customer_id 或 vendor_id ",
                        "success": False}), 400   
    
    cart = Cart.query.get(customer_id)

    if not cart:
        return jsonify({"message": "購物車中沒有商品",
                        "success": False}), 404
    
    if (vendor_id != cart.vendor_id):
        return jsonify({"message": "vendor_id 不符合",
                        "success": False
                        }), 400
    
    policy_id = data.get("policy_id")
    note = data.get("note")
    payment_methods = data.get("payment_methods")
    
    return generate_new_order(cart, policy_id, note, payment_methods)

    

    