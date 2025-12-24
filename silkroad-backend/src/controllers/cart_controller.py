from flask import jsonify, request, session
from config import db
from models import Cart_Item, Cart, Customer, Product
from utils import require_login

import uuid

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
        raise e
    
@require_login(["customer"])
def add_to_cart():
    data = request.get_json()
    
    #     預計傳給我{
    #     "customer_id":XXX,
    #     "vendor_id":XXX,
    #     "product_id":XXX,
    #     "quantity":XXX,
    #     "selected_sugar":XXX,
    #     "selected_ice":XXX,
    #     "selected_sizece":XXX
    #     }

    customer_id = data.get("customer_id")
    vendor_id = data.get("vendor_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")   
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    selected_size = data.get("selected_size")

    if not customer_id or not vendor_id:
        return jsonify({"message": "缺少 customer_id 或 vendor_id ",
                        "success": False}), 400

    try:
        cart = get_user_cart(customer_id, vendor_id)
    except Exception as e:
        return jsonify({"message": f"{e}",
                        "success": False}), 404
    

    if cart.vendor_id != vendor_id:
        cart.clear()
        cart.vendor_id = vendor_id

    cart_id = customer_id

    if not all([product_id, quantity, selected_sugar, selected_ice, selected_size]):
        return jsonify({"message": "缺少必要欄位 (product_id, quantity, selected_sugar...)",
                        "success": False
                        }), 400
    
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
        return jsonify({"message": f"資料庫錯誤: {str(e)}",
                        "success": False
                        }), 500
    
    return jsonify({"message": "新增商品成功", "success": True}), 200
    
@require_login(["customer"])
def remove_from_cart():
    data = request.get_json()

    cart_item_id = data.get('cart_item_id')

    if not cart_item_id:
        return jsonify({"message": "loss cart_item_id", "success": False}), 400
        
    try:
        item_to_delete = Cart_Item.query.get(cart_item_id)

        if not item_to_delete:
            return jsonify({"message": "cart_item_id not found", "success": False}), 404

        parent_cart = item_to_delete.cart 

        db.session.delete(item_to_delete)
        db.session.commit()

        # remaining_items_count = db.session.query(Cart_Item).filter_by(cart_id=customer_id).count()

        # if remaining_items_count == 0:
        #     if parent_cart:
        #         db.session.delete(parent_cart)
        #         db.session.commit()
            
        #     return jsonify({
        #         "message": "購物車已清空",
        #         "success": True
        #     }), 200

        return jsonify({
            "message": "成功移除購物車項目",
            "success": True
            #"remaining_items_count": remaining_items_count
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error removing item: {e}")
        return jsonify({"message": "系統錯誤，移除失敗", "error": str(e)}), 500

@require_login(["customer"])
def view_cart(cart_id : int):
    
    customer_id = cart_id
    
    if not customer_id:
        return jsonify({"message": "缺少 customer_id", "success": False}), 400

    try:
        current_cart = Cart.query.filter_by(customer_id=customer_id).first()

        if not current_cart:
            if Customer.query.get(customer_id):
                return jsonify({
                    "data": [],
                    "message": "cart is empty",
                    "success": True,
                    "total_amount": 0
                }), 200
            else:
                return jsonify({"message": "invalid customer_id", "success": False}), 404

        cart_items = current_cart.items 
        
        result_list = []
        total_price = 0

        for item in cart_items:
            product = item.product
            
            if product:
                item_sub_price = product.price * item.quantity
                total_price += item_sub_price
                
                result_list.append({
                    "cart_item_id": item.id,
                    "product_id": item.product_id,

                    "product_name": product.name,
                    "product_image": product.image_url,

                    "price": product.price,
                    "quantity": item.quantity,
                    "subtotal": item_sub_price,

                    "selected_sugar": item.selected_sugar,
                    "selected_ice": item.selected_ice,
                    "selected_size": item.selected_size
                })

        return jsonify({
            "data": result_list,
            "total_amount": total_price,
            "message": "cart item view",
            "success": True
        }), 200

    except Exception as e:
        print(f"Error details: {e}")
        return jsonify({'message': '系統錯誤', 'error': str(e)}), 500

#================ guest user ================
def add_to_cart_guest():
    data = request.get_json()
    
    vendor_id = data.get("vendor_id")
    product_id = data.get("product_id") 
    quantity = data.get("quantity")   
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    selected_size = data.get("selected_size")
    
    if not vendor_id:
        return jsonify({"message": "缺少 vendor_id ",
                        "success": False}), 400
        
    if not all([product_id, quantity, selected_sugar, selected_ice, selected_size]):
        return jsonify({"message": "缺少必要欄位 (product_id, quantity, selected_sugar...)",
                        "success": False
                        }), 400
    if "cart" not in session:
        session["cart"] = {
            "vendor_id" : vendor_id,
            "items" : []
        }
        
    if vendor_id != session["cart"]["vendor_id"]:
        session["cart"] = {
            "vendor_id" : vendor_id,
            "items" : []
        }
        
    session["cart"]["items"].append({
        "tmp_cart_item_id": str(uuid.uuid4())[:8],
        "product_id": product_id,
        "quantity": quantity,
        "selected_sugar": selected_sugar,
        "selected_ice": selected_ice,
        "selected_size": selected_size
    })
    
    session.modified = True
    
    return jsonify({"message": "新增商品成功", "success": True}), 200

def remove_from_cart_guest():
    data = request.get_json()
    
    cart_item_id = data.get('cart_item_id')
    customer_id = data.get('customer_id')

    if not cart_item_id or not customer_id:
        return jsonify({"message": "缺少 cart_item_id 或 customer_id",
                        "success": False
                        }), 400
    if "cart" not in session or session["cart"]["items"] == []:
        return jsonify({"message": "empty cart",
                        "success": False
                        }), 404
        
    for item in session["cart"]["items"]:
        if item["tmp_cart_item_id"] == cart_item_id:
            session["cart"]["items"].remove(item)
            session.modified = True
            return jsonify({"message": "刪除商品成功",
                            "success": True
                            }), 200
    return jsonify({"message": "cart_item_id not found",
                    "success": False
                    }), 404
    
def view_cart_guest(*args, **kwargs):
    if "cart" not in session or session["cart"]["items"] == []:
        return jsonify({
            "data": [],
            "message": "cart is empty",
            "success": True,                           
            "total_amount": 0
        }), 200
    
    total_price = 0    
    result = []
    # try:
    for item in session["cart"]["items"]:
        try:
            product = Product.query.get(item["product_id"])
        except Exception as e:
            return jsonify({
                "message": str(e),
                "success": False
            }), 500
        
        if not product:
            # Should not happen, but handle it gracefully
            continue
            
        item_sub_price = product.price * item["quantity"]
        total_price += item_sub_price    
            
        result.append({
            "cart_item_id": item["tmp_cart_item_id"],
            "product_id": item["product_id"],

            "product_name": product.name,
            "product_image": product.image_url,

            "price": product.price,
            "quantity": item["quantity"],
            "subtotal": item_sub_price,

            "selected_sugar": item["selected_sugar"],
            "selected_ice": item["selected_ice"],
            "selected_size": item["selected_size"]
        })
        
    return jsonify({
        "message": "success",
        "success": True,
        "total_price": total_price,
        "data": result
    }), 200
    # except Exception as e:
    #     return jsonify({
    #         "message": str(e),
    #         "success": False
    #     }), 500
    
