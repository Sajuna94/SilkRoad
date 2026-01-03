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
    
@require_login(role=["customer"])
def add_to_cart():
    data = request.get_json()
    
    customer_id = session.get("user_id")
    if not customer_id:
        return jsonify({"message": "無法取得 user_id，尚未登入?", "success": False}), 400

    vendor_id = data.get("vendor_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")   
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    
    raw_size = data.get("selected_size")
    selected_size_str = ""
    
    if isinstance(raw_size, dict):
        selected_size_str = raw_size.get("name", "") # 取出 "M"
    else:
        selected_size_str = str(raw_size) # 確保是字串

    if not vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400

    try:
        cart = get_user_cart(customer_id, vendor_id)
    except Exception as e:
        return jsonify({"message": f"{e}", "success": False}), 404
    
    if cart.vendor_id != vendor_id:
        cart.clear()
        cart.vendor_id = vendor_id

    cart_id = customer_id

    # 注意：這裡驗證要用 selected_size_str
    if not all([product_id, quantity, selected_sugar, selected_ice, selected_size_str]):
        return jsonify({
            "message": "缺少必要欄位 (product_id, quantity, selected_sugar...)", 
            "success": False
        }), 400
    
    
    new_cart_item = Cart_Item(
        cart_id = cart_id,
        product_id = product_id,
        quantity = quantity,
        selected_sugar = selected_sugar,
        selected_ice = selected_ice,
        
        # [關鍵修改] 這裡一定要存字串，不能存物件
        selected_size = selected_size_str 
    )

    try:
        db.session.add(new_cart_item)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error adding to cart: {e}") # 建議印出錯誤以便除錯
        return jsonify({"message": f"資料庫錯誤: {str(e)}", "success": False}), 500
    
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
    if cart_id == 0: 
        customer_id = session.get('user_id')

    print(customer_id)
    
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
                # --- 修改開始：計算尺寸加價 ---
                size_delta = 0
                
                # 1. 確保該產品有設定尺寸選項
                if product.sizes_option and product.sizes_option.options:
                    # 2. 解析尺寸字串為列表 ["S", "M", "L"]
                    size_list = [s.strip() for s in product.sizes_option.options.split(',') if s.strip()]
                    
                    # 3. 找出 user 選的尺寸在列表中的位置 (Index)
                    # item.selected_size 應該存的是字串 "M"
                    if item.selected_size in size_list:
                        index = size_list.index(item.selected_size)
                        # 4. 計算加價：第 0 個 +0，第 1 個 +10，第 2 個 +20...
                        size_delta = index * 10
                
                # 5. 計算正確的單價 (基本價 + 尺寸加價)
                final_unit_price = product.price + size_delta
                
                # 6. 計算小計
                item_sub_price = final_unit_price * item.quantity
                # --- 修改結束 ---

                total_price += item_sub_price

                result_list.append({
                    "cart_item_id": item.id,
                    "product_id": item.product_id,
                    "vendor_id": product.vendor_id,

                    "product_name": product.name,
                    "product_image": product.image_url,

                    "price": final_unit_price, # 這裡回傳加價後的單價給前端顯示比較清楚
                    "base_price": product.price, # (選填) 如果前端想顯示原價可回傳這個
                    "size_delta": size_delta,    # (選填) 顯示加了多少錢
                    
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
    
@require_login(["customer"])
def clean_cart():
    data = request.get_json()
    
    customer_id = session.get("user_id") or data.get("customer_id")

    if not customer_id:
        return jsonify({
            "message": "缺少 customer_id",
            "success": False
        }), 400

    try:
        current_cart = Cart.query.filter_by(customer_id=customer_id).first()

        if not current_cart:
            return jsonify({
                "message": "購物車已是空的，無需清理",
                "success": True
            }), 200


        Cart_Item.query.filter_by(cart_id=customer_id).delete()

        db.session.delete(current_cart)

        db.session.commit()

        return jsonify({
            "message": "購物車已成功清空",
            "success": True
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error cleaning cart: {e}")
        return jsonify({
            "message": "系統錯誤，清空失敗",
            "error": str(e),
            "success": False
        }), 500

@require_login(["customer"])
def update_cart_item():
    """
    Update an existing cart item's quantity and/or customization options.

    Expected payload:
    {
        "cart_item_id": int (required),
        "quantity": int (optional),
        "selected_sugar": str (optional),
        "selected_ice": str (optional),
        "selected_size": str (optional)
    }

    Returns:
    {
        "message": str,
        "success": bool
    }
    """
    data = request.get_json()

    # Get customer ID from session
    customer_id = session.get("user_id")
    if not customer_id:
        return jsonify({
            "message": "無法取得 user_id，尚未登入?",
            "success": False
        }), 400

    # Get cart_item_id (required)
    cart_item_id = data.get("cart_item_id")
    if not cart_item_id:
        return jsonify({
            "message": "缺少 cart_item_id",
            "success": False
        }), 400

    # Get optional update fields
    quantity = data.get("quantity")
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    selected_size = data.get("selected_size")

    # At least one field should be provided for update
    if not any([quantity, selected_sugar, selected_ice, selected_size]):
        return jsonify({
            "message": "至少需要提供一個更新欄位 (quantity, selected_sugar, selected_ice, selected_size)",
            "success": False
        }), 400

    try:
        # Find the cart item
        cart_item = Cart_Item.query.get(cart_item_id)

        if not cart_item:
            return jsonify({
                "message": "找不到該購物車項目",
                "success": False
            }), 404

        # Verify the cart item belongs to the current user
        if cart_item.cart_id != customer_id:
            return jsonify({
                "message": "您沒有權限修改此購物車項目",
                "success": False
            }), 403

        # Validate quantity if provided
        if quantity is not None:
            if not isinstance(quantity, int) or quantity <= 0:
                return jsonify({
                    "message": "數量必須為正整數",
                    "success": False
                }), 400
            cart_item.quantity = quantity

        # Update customization options if provided
        if selected_sugar is not None:
            cart_item.selected_sugar = selected_sugar

        if selected_ice is not None:
            cart_item.selected_ice = selected_ice

        if selected_size is not None:
            cart_item.selected_size = selected_size

        # Commit changes
        db.session.commit()

        return jsonify({
            "message": "購物車項目更新成功",
            "success": True
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating cart item: {e}")
        return jsonify({
            "message": "系統錯誤，更新失敗",
            "error": str(e),
            "success": False
        }), 500

#================ guest user ================
def add_to_cart_guest():
    data = request.get_json()
    
    vendor_id = data.get("vendor_id")
    product_id = data.get("product_id") 
    quantity = data.get("quantity")   
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    
    # --- [修改 1] 處理 selected_size (物件轉字串) ---
    raw_size = data.get("selected_size")
    selected_size_str = ""
    
    if isinstance(raw_size, dict):
        selected_size_str = raw_size.get("name", "")
    else:
        selected_size_str = str(raw_size)
    # ---------------------------------------------
    
    if not vendor_id:
        return jsonify({"message": "缺少 vendor_id ", "success": False}), 400
        
    # 注意：這裡驗證要用 selected_size_str
    if not all([product_id, quantity, selected_sugar, selected_ice, selected_size_str]):
        return jsonify({
            "message": "缺少必要欄位 (product_id, quantity, selected_sugar...)",
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
        
        # [關鍵] 存入處理過的字串
        "selected_size": selected_size_str
    })
    
    session.modified = True
    
    return jsonify({"message": "新增商品成功", "success": True}), 200

def remove_from_cart_guest():
    data = request.get_json()
    
    cart_item_id = data.get("cart_item_id")

    if "cart" not in session or session["cart"]["items"] == []:
        return jsonify({"message": "empty cart",
                        "success": False
                        }), 404
        
    original_length = len(session["cart"]["items"])
    session["cart"]["items"] = [
        item for item in session["cart"]["items"] 
        if item["tmp_cart_item_id"] != cart_item_id
    ]

    if len(session["cart"]["items"]) < original_length:
        session.modified = True
        return jsonify({
            "message": "刪除商品成功",
            "success": True
        }), 200
    else:
        return jsonify({
            "message": "找不到該商品",
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
    
    for item in session["cart"]["items"]:
        try:
            product = Product.query.get(item["product_id"])
        except Exception as e:
            return jsonify({
                "message": str(e),
                "success": False
            }), 500

        if not product:
            continue

        # --- [修改 2] 計算尺寸加價 (Index * 10) ---
        size_delta = 0
        current_size_name = item["selected_size"] # 這裡是字串 "M"

        if product.sizes_option and product.sizes_option.options:
            # 1. 解析 DB 中的選項列表
            size_list = [s.strip() for s in product.sizes_option.options.split(',') if s.strip()]
            
            # 2. 找出目前尺寸的 Index
            if current_size_name in size_list:
                index = size_list.index(current_size_name)
                # 3. 計算加價
                size_delta = index * 10
        
        # 4. 算出最終單價
        final_unit_price = product.price + size_delta
        
        # 5. 算出該項目的小計
        item_sub_price = final_unit_price * item["quantity"]
        # ----------------------------------------

        total_price += item_sub_price

        result.append({
            "cart_item_id": item["tmp_cart_item_id"],
            "product_id": item["product_id"],
            "vendor_id": product.vendor_id,

            "product_name": product.name,
            "product_image": product.image_url,

            # 回傳加價後的單價
            "price": final_unit_price,
            "base_price": product.price, # (可選) 讓前端知道原價
            "size_delta": size_delta,    # (可選) 讓前端知道加了多少
            
            "quantity": item["quantity"],
            "subtotal": item_sub_price,

            "selected_sugar": item["selected_sugar"],
            "selected_ice": item["selected_ice"],
            "selected_size": item["selected_size"]
        })

    return jsonify({
        "message": "success",
        "success": True,
        "total_amount": total_price, # 注意：我把這裡的 key 統一改成 total_amount 跟會員版一樣，若前端用 total_price 請自行改回
        "data": result
    }), 200

def update_cart_item_guest():
    """
    Update an existing cart item for guest users (session-based cart).

    Expected payload:
    {
        "cart_item_id": str (required - the tmp_cart_item_id),
        "quantity": int (optional),
        "selected_sugar": str (optional),
        "selected_ice": str (optional),
        "selected_size": str or dict (optional)
    }

    Returns:
    {
        "message": str,
        "success": bool
    }
    """
    data = request.get_json()

    # Check if guest cart exists
    if "cart" not in session or not session["cart"]["items"]:
        return jsonify({
            "message": "購物車是空的",
            "success": False
        }), 404

    # Get cart_item_id (required)
    cart_item_id = data.get("cart_item_id")
    if not cart_item_id:
        return jsonify({
            "message": "缺少 cart_item_id",
            "success": False
        }), 400

    # Get optional update fields
    quantity = data.get("quantity")
    selected_sugar = data.get("selected_sugar")
    selected_ice = data.get("selected_ice")
    selected_size = data.get("selected_size")

    # At least one field should be provided for update
    if not any([quantity is not None, selected_sugar, selected_ice, selected_size]):
        return jsonify({
            "message": "至少需要提供一個更新欄位 (quantity, selected_sugar, selected_ice, selected_size)",
            "success": False
        }), 400

    # Find the cart item in session
    cart_item = None
    for item in session["cart"]["items"]:
        if item["tmp_cart_item_id"] == cart_item_id:
            cart_item = item
            break

    if not cart_item:
        return jsonify({
            "message": "找不到該購物車項目",
            "success": False
        }), 404

    try:
        # Validate and update quantity if provided
        if quantity is not None:
            if not isinstance(quantity, int) or quantity <= 0:
                return jsonify({
                    "message": "數量必須為正整數",
                    "success": False
                }), 400
            cart_item["quantity"] = quantity

        # Update customization options if provided
        if selected_sugar is not None:
            cart_item["selected_sugar"] = selected_sugar

        if selected_ice is not None:
            cart_item["selected_ice"] = selected_ice

        if selected_size is not None:
            # Handle selected_size (could be dict or string)
            if isinstance(selected_size, dict):
                cart_item["selected_size"] = selected_size.get("name", "")
            else:
                cart_item["selected_size"] = str(selected_size)

        # Mark session as modified to ensure changes are saved
        session.modified = True

        return jsonify({
            "message": "購物車項目更新成功",
            "success": True
        }), 200

    except Exception as e:
        print(f"Error updating guest cart item: {e}")
        return jsonify({
            "message": "系統錯誤，更新失敗",
            "error": str(e),
            "success": False
        }), 500


