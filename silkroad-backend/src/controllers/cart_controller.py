#Gs0n控管了這裡

from flask import jsonify, request
from config import db
from models import Cart_Item
from models import Cart

def get_user_cart(customer_id, vendor_id):
    
    cart = Cart.query.get(customer_id)
    if cart:
        return cart
    else:
        new_cart = Cart(
        customer_id = customer_id, 
        vendor_id = vendor_id
    )
        
    try:
        db.session.add(new_cart)
        db.session.commit()
        return new_cart
    except Exception as e:
        db.session.rollback()
        return Cart.query.get(customer_id) #find again
    
def add_to_cart():
    data = request.get_json()
    
    #     預計傳給我{
    #     customer_id:XXX,
    #     vendor_id:XXX,
    #     product_id:XXX,
    #     quantity:XXX,
    #     selected_sugar:XXX,
    #     selected_ice:XXX,
    #     selected_sizece:XXX
    # }

    customer_id = data.get("customer_id")
    vendor_id = data.get("vendor_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")   
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    selected_size = data.get("selected_size")

    if not customer_id or not vendor_id:
        return jsonify({"message": "缺少 customer_id 或 vendor_id "}), 400

    get_user_cart(customer_id, vendor_id)

    cart_id = customer_id

    if not all([product_id, quantity, selected_sugar, selected_ice, selected_size]):
        return jsonify({"message": "缺少必要欄位 (product_id, quantity, selected_sugar...)"}), 400
    
    new_cart_item = Cart_Item(
        cart_id = cart_id,
        product_id = product_id,
        quantity = quantity,
        selected_sugar = selected_sugar,
        selected_ice = selected_ice,
        selected_size = selected_size
    )

    try:
        db.session.add(new_cart_item)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"資料庫錯誤: {str(e)}"}), 500
    
    return jsonify({"message": "新增商品成功"}), 201 

def remove_from_cart():
    return jsonify({"message": "call : 'remove_from_cart' WIP"}), 200

def view_cart():
    return jsonify({"message": "call : 'view_cart' WIP"}), 200