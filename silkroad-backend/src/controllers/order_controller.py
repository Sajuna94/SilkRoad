from flask import jsonify, request,session
from config import db
from models import Cart_Item, Cart, Order, Order_Item, Discount_Policy, Customer, Vendor,Review, Sizes_Option
from datetime import date, datetime
from sqlalchemy import or_

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

    # --- 檢查折價券是否已被使用過 ---
    existing_order = Order.query.filter_by(
        user_id=user_id,
        policy_id=policy_id
    ).filter(
        # 修正：正確處理 NULL 值，只排除明確標記為 'refunded' 的訂單
        or_(Order.refund_status.is_(None), Order.refund_status != 'refunded')
    ).first()

    if existing_order:
        raise ValueError("此折價券已使用過，不可重複使用")
    
    discount_amount = 0
    discount_type = str(discount.type).lower()

    if str(discount_type) == 'percent':
        # value 是整數（例如 20 代表 20%），需要除以 100 轉換為小數
        discount_amount = total_price_accumulated * (discount.value / 100)
    elif str(discount_type) == 'fixed':
        discount_amount = discount.value
    
    discount_amount = int(discount_amount)

    if discount.max_discount is not None:
        if discount_amount > discount.max_discount:
            discount_amount = discount.max_discount

    final_price = total_price_accumulated - discount_amount
    return int(max(final_price, 0))


def generate_new_order(cart, policy_id, note, payment_methods, is_delivered, address_info):
    user_id = cart.customer_id
    vendor_id = cart.vendor_id
    total_price_accumulated = 0

    try:
        # --- 步驟 1: 先計算購物車總價（不創建訂單） ---
        item_details = []

        for item in cart.items:
            product = item.product
            if not product:
                raise ValueError(f"商品 ID {item.product_id} 不存在")

            # --- 修改開始：根據新 SQL 結構查詢加價 ---
            # 直接從 Sizes_Option 表中查找該產品對應的尺寸資料
            size_opt = Sizes_Option.query.filter_by(
                product_id=item.product_id, 
                options=item.selected_size
            ).first()

            # 取得該尺寸專屬的 price_step，若找不到則預設加價為 0
            size_delta = size_opt.price_step if size_opt else 0
            # --- 修改結束 ---

            # 計算單價與累加總價
            unit_price = product.price + size_delta
            total_price_accumulated += unit_price * item.quantity

            # 暫存計算好的結果，確保後續寫入 Order_Item 時價格一致
            item_details.append({
                "item_obj": item,
                "calculated_unit_price": unit_price
            })

        # --- 步驟 2: 驗證並計算折扣（在創建訂單之前） ---
        final_price = do_discount(total_price_accumulated, policy_id, user_id)

        # --- 步驟 3: 折扣驗證通過後，才創建訂單 ---
        new_order = Order(
            user_id = user_id,
            vendor_id = vendor_id,
            policy_id = policy_id,
            total_price = final_price,  # 直接設置最終價格
            discount_amount = total_price_accumulated - final_price,  # 計算折扣金額
            note = note,
            payment_methods = payment_methods,
            refund_status = None,
            refund_at = None,
            is_completed = False,
            is_delivered = is_delivered,
            address_info = address_info,
            deliver_status = None
        )

        db.session.add(new_order)
        db.session.flush()

        # --- 步驟 4: 創建訂單項目 ---
        for detail in item_details:
            store_and_calculate_item(new_order, detail["item_obj"], detail["calculated_unit_price"])

        # --- 步驟 5: 如果使用儲值餘額支付，扣除餘額 ---
        if payment_methods == 'button':
            customer = Customer.query.filter_by(user_id=user_id).first()
            if not customer:
                raise ValueError("找不到顧客資訊")

            # 檢查餘額是否足夠
            if customer.stored_balance < final_price:
                raise ValueError(f"儲值餘額不足！目前餘額：${customer.stored_balance}，訂單金額：${final_price}")

            # 扣除餘額
            customer.stored_balance -= final_price

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

'''    
def store_and_calculate_item(new_order, item):
    product = item.product
    if not product:
        raise ValueError(f"project ID {item.product_id} do not exist。")

    # --- [修改] 計算單價 (含尺寸加價) ---
    size_delta = 0
    selected_size_str = item.selected_size # 這裡是字串 "M"

    # 1. 確保該產品有設定尺寸選項
    if product.sizes_option and product.sizes_option.options:
        # 2. 解析尺寸字串為列表 ["S", "M", "L"]
        size_list = [s.strip() for s in product.sizes_option.options.split(',') if s.strip()]
        
        # 3. 找出選中尺寸的 Index
        if selected_size_str in size_list:
            index = size_list.index(selected_size_str)
            # 4. 計算加價：第 0 個 +0，第 1 個 +10...
            size_delta = index * item.product.sizes_option.price_step
    
    # 5. 計算正確單價
    unit_price = product.price + size_delta
    # --------------------------------

    items_price = unit_price * item.quantity 
    
    new_order_item = Order_Item(
        order_id = new_order.id,
        product_id = item.product_id,
        quantity = item.quantity,
        
        # 這裡存入的 price 必須是 "加價後" 的單價
        price = unit_price, 
        
        selected_sugar = item.selected_sugar,
        selected_ice = item.selected_ice,
        selected_size = item.selected_size,
    )
    db.session.add(new_order_item)
    
    return items_price
'''
def store_and_calculate_item(new_order, item, unit_price):
    """
    將購物車品項存入訂單明細
    new_order: 剛建立的訂單物件
    item: 購物車內的品項 (Cart_Item)
    unit_price: 已經由 generate_new_order 算好的「最終單價」
    """
    
    # 直接建立訂單明細項目
    new_order_item = Order_Item(
        order_id = new_order.id,
        product_id = item.product_id,
        quantity = item.quantity,
        
        # 關鍵：直接存入傳進來的 unit_price (這是一個快照，以後產品漲價也不影響此訂單)
        price = unit_price, 
        
        selected_sugar = item.selected_sugar,
        selected_ice = item.selected_ice,
        selected_size = item.selected_size,
    )
    
    db.session.add(new_order_item)
    
    # 回傳該項目的總價 (小計)，供外部核對（選用）
    return unit_price * item.quantity

def trans_to_order():
    data = request.get_json()
    """
    預計傳給我{
    "customer_id":int,
    "vendor_id":int,
    "policy_id":int,
    "note":string,
    "payment_methods":enum('cash','button'),
    "is_delivered":bool,
    "shipping_address":string (外送時必填)
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

    # [方案 4 - 被動驗證] 在結帳時驗證 vendor 是否被 ban 或未驗證
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({"message": "找不到該店家",
                        "success": False}), 404

    if not vendor.is_verified:
        return jsonify({
            "message": "該店家尚未完成驗證，無法結帳。",
            "success": False
        }), 403

    if not vendor.is_active:
        return jsonify({
            "message": "該店家已停業，無法結帳。購物車中的商品將被清除。",
            "success": False
        }), 400

    policy_id = data.get("policy_id")
    note = data.get("note")
    payment_methods = data.get("payment_methods")
    is_delivered = data.get("is_delivered", False)  # 預設為 False (自取)
    
    # --- [修改 1] 獲取地址資訊 ---
    address_info = data.get("shipping_address")

    # --- [修改 2] 加入外送地址驗證邏輯 ---
    if is_delivered and not address_info:
        return jsonify({
            "message": "選擇外送時，配送地址 (shipping_address) 為必填欄位",
            "success": False
        }), 400
    
    # 如果是自取，強制清空地址 (選擇性邏輯，看你是否想保留)
    if not is_delivered:
        address_info = None

    # --- [修改 3] 將 address_info 傳遞給下一個函式 ---
    return generate_new_order(cart, policy_id, note, payment_methods, is_delivered, address_info)

def view_order():
    data = request.get_json()
    """
    預計傳給我{
    "order_id":XXX,
    "user_id":XXX,
    "vendor_id":XXX (optional),
    }
    """

    if not data:
        return jsonify({'message': '無效的請求數據',
                        "success": False}), 400

    order_id = data.get("order_id")
    request_user_id = data.get("user_id")
    request_vendor_id = data.get("vendor_id")

    if not order_id or not request_user_id:
        return jsonify({"message": "缺少 order_id 或 user_id"}), 400

    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({"message": "查無訂單",
                            "success": False}), 400

        # 驗證 user_id 必須匹配
        if order.user_id != request_user_id:
            return jsonify({"message": "user_id 不匹配",
                            "success": False}), 400

        # 如果提供了 vendor_id，也驗證它
        if request_vendor_id is not None and order.vendor_id != request_vendor_id:
            return jsonify({"message": "vendor_id 不匹配",
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
            "discount_amount": order.discount_amount,
            "note": order.note,
            "payment_methods": str(order.payment_methods),
            "refund_status": str(order.refund_status) if order.refund_status else None,
            "refund_at": order.refund_at.strftime('%Y-%m-%d %H:%M:%S') if order.refund_at else None,
            "is_completed": order.is_completed,
            "is_delivered": order.is_delivered,
            "total_price": order.total_price,
            "address_info": order.address_info,
            "deliver_status": order.deliver_status
        })
        
        return jsonify({
            "data": result_list,
            "order_info": order_info,            
            "message": "order items view",
            "success": True,         
        })
    except Exception as e:
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
    refund_at = data.get("refund_at") #格式： YYYY-MM-DD HH:mm:ss
    is_completed = data.get("is_completed")
    is_delivered = data.get("is_delivered")
    deliver_status = data.get("deliver_status")

    able_refund_status = ['pending', 'refunded', 'rejected', None]
    able_deliver_status = ['delivering', 'delivered', None]

    try:
        if refund_status is not None:
            if refund_status not in able_refund_status:
                return jsonify({"message": "refund_status 傳值錯誤",
                                "success": False}), 400

            # 防止重複退款
            if refund_status == "refunded" and order.refund_status == "refunded":
                return jsonify({"message": "此訂單已退款，無法重複退款",
                                "success": False}), 400

            order.refund_status = refund_status

        if refund_status == "refunded":
            if refund_at is None:
                return jsonify({"message": "refund_at 傳值錯誤",
                                "success": False}), 400
            order.refund_at = datetime.strptime(refund_at, '%Y-%m-%d %H:%M:%S')

            # 如果是儲值金支付，退款到顧客帳戶
            if order.payment_methods == 'button':
                customer = Customer.query.filter_by(user_id=order.user_id).first()
                if not customer:
                    return jsonify({"message": "找不到顧客資訊",
                                    "success": False}), 404

                refund_amount = order.total_price
                customer.stored_balance += refund_amount

            # 如果訂單已完成，減少商家營業額
            if order.is_completed:
                vendor = Vendor.query.filter_by(user_id=order.vendor_id).first()
                if vendor:
                    revenue_decrease = order.total_price
                    vendor.revenue -= revenue_decrease

        elif refund_status != 'refunded' and refund_at is not None:
             return jsonify({"message": "refund_status 不為 'refunded'",
                             "success": False}), 400
        elif refund_status in [None, 'rejected'] and refund_at is None:
            order.refund_at = None

        if is_completed is not None:
            if not isinstance(is_completed, bool):
                return jsonify({"message": "is_completed 必須是bool",
                                "success": False}), 400

            # 如果訂單從未完成變為完成，增加商家營業額
            if is_completed and not order.is_completed:
                vendor = Vendor.query.filter_by(user_id=order.vendor_id).first()
                if vendor:
                    revenue_increase = order.total_price
                    vendor.revenue += revenue_increase

            order.is_completed = is_completed

        if is_delivered is not None:
            if not isinstance(is_delivered, bool):
                return jsonify({"message": "is_delivered 傳值錯誤",
                                "success": False}), 400
            order.is_delivered = is_delivered

        if deliver_status is not None:
            if deliver_status not in able_deliver_status:
                return jsonify({"message": "deliver_status 傳值錯誤，必須是 'delivering', 'delivered' 或 None",
                                "success": False}), 400
            order.deliver_status = deliver_status

        db.session.commit()
        # return jsonify({"message": "訂單資訊更新成功",
        #                 "success": True}), 200

        result_list = []
        for item in order.items:
            product = item.product
            result_list.append({
                "order_item_id": item.id,
                "product_id": item.product_id,
                "product_name": product.name if product else "未知商品",
                "product_image": product.image_url if product else None,
                "price": item.price,
                "quantity": item.quantity,
                "subtotal": item.price * item.quantity,
                "selected_sugar": item.selected_sugar,
                "selected_ice": item.selected_ice,
                "selected_size": item.selected_size
            })

        order_info = ({
            "discount_amount": order.discount_amount,
            "note": order.note,
            "payment_methods": str(order.payment_methods),
            "refund_status": str(order.refund_status) if order.refund_status else None,
            "refund_at": order.refund_at.strftime('%Y-%m-%d %H:%M:%S') if order.refund_at else None,
            "is_completed": order.is_completed,
            "is_delivered": order.is_delivered,
            "total_price": order.total_price,
            "deliver_status": order.deliver_status
        })
        
        return jsonify({
            "data": result_list,
            "order_info": order_info,            
            "message": "訂單資訊更新成功",
            "success": True,         
        }) ,200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "伺服器內部錯誤", "success": False}), 500
    
def view_all_user_orders():
    from sqlalchemy.orm import joinedload

    data = request.get_json()
    request_user_id = data.get("user_id")

    if not request_user_id:
        return jsonify({"message": "缺少 user_id", "success": False}), 400

    try:
        # 1. 抓取該使用者的所有訂單，使用 eager loading 避免 N+1 查詢問題
        orders = Order.query.filter_by(user_id=request_user_id)\
            .options(joinedload(Order.items).joinedload(Order_Item.product))\
            .order_by(Order.id.desc()).all()

        # 1.5 批量查詢所有訂單的評論（避免 N+1 查詢）
        order_ids = [order.id for order in orders]
        reviews = Review.query.filter(Review.order_id.in_(order_ids)).all()
        # 建立 order_id -> review 的映射
        review_map = {review.order_id: review for review in reviews}

        all_orders_data = []

        for order in orders:
            # 2. 針對「每一筆訂單」建立其商品清單
            items_in_this_order = []
            for item in order.items:
                product = item.product
                items_in_this_order.append({
                    "order_item_id": item.id,
                    "product_id": item.product_id,
                    "product_name": product.name if product else "未知商品",
                    "product_image": product.image_url if product else None,
                    "price": item.price,
                    "quantity": item.quantity,
                    "subtotal": item.price * item.quantity,
                    "selected_sugar": item.selected_sugar,
                    "selected_ice": item.selected_ice,
                    "selected_size": item.selected_size
                })

            # 2.5 從映射中查找該訂單的評論（記憶體查找，不查詢資料庫）
            review = review_map.get(order.id)
            has_reviewed = review is not None
            review_id = review.id if review else None

            # 3. 將訂單摘要與商品詳情打包
            all_orders_data.append({
                "order_id": order.id,
                "vendor_id": order.vendor_id,
                "total_price": order.total_price,
                "discount_amount": order.discount_amount,
                "is_completed": order.is_completed,
                "refund_status": str(order.refund_status) if order.refund_status else None,
                "created_at": order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "has_reviewed": has_reviewed,
                "review_id": review_id,
                "items": items_in_this_order,
                "address_info": order.address_info,
                "deliver_status": order.deliver_status
            })

        return jsonify({
            "data": all_orders_data,
            "message": "成功取得所有訂單與細項",
            "success": True,
        })
    except Exception as e:
        return jsonify({"message": "系統錯誤", "error": str(e), "success": False}), 500

def view_all_vendor_orders():
    from sqlalchemy.orm import joinedload

    data = request.get_json()
    request_vendor_id = data.get("vendor_id")

    if not request_vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400

    try:
        # 抓取該 vendor 的所有訂單，使用 eager loading 避免 N+1 查詢問題
        orders = Order.query.filter_by(vendor_id=request_vendor_id)\
            .options(joinedload(Order.items).joinedload(Order_Item.product))\
            .order_by(Order.id.desc()).all()

        all_orders_data = []

        for order in orders:
            # 針對每一筆訂單建立其商品清單
            items_in_this_order = []
            for item in order.items:
                product = item.product
                items_in_this_order.append({
                    "order_item_id": item.id,
                    "product_id": item.product_id,
                    "product_name": product.name if product else "未知商品",
                    "product_image": product.image_url if product else None,
                    "price": item.price,
                    "quantity": item.quantity,
                    "subtotal": item.price * item.quantity,
                    "selected_sugar": item.selected_sugar,
                    "selected_ice": item.selected_ice,
                    "selected_size": item.selected_size
                })

            # 將訂單摘要與商品詳情打包
            all_orders_data.append({
                "order_id": order.id,
                "user_id": order.user_id,
                "total_price": order.total_price,
                "discount_amount": order.discount_amount,
                "is_completed": order.is_completed,
                "is_delivered": order.is_delivered,
                "payment_methods": str(order.payment_methods),
                "refund_status": str(order.refund_status) if order.refund_status else None,
                "note": order.note,
                "created_at": order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "items": items_in_this_order,
                "address_info": order.address_info,
                "deliver_status": order.deliver_status
            })

        return jsonify({
            "data": all_orders_data,
            "message": "成功取得 vendor 所有訂單與細項",
            "success": True,
        })
    except Exception as e:
        return jsonify({"message": "系統錯誤", "error": str(e), "success": False}), 500
    
def check_order_review_status():
    data = request.get_json()
    
    order_id = data.get("order_id")

    if not order_id:
        return jsonify({"message": "缺少 order_id", "success": False}), 400

    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"message": "找不到該訂單", "success": False}), 404

        review = Review.query.filter_by(order_id=order_id).first()

        is_reviewed = False
        review_data = None

        if review:
            is_reviewed = True
            review_data = {
                "review_id": review.id,
                "rating": review.rating,
                "content": review.review_content,
                "created_at": review.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }

        return jsonify({
            "success": True,
            "message": "查詢成功",
            "has_reviewed": is_reviewed, # True 代表已評論，False 代表未評論
            "data": review_data
        }), 200

    except Exception as e:
        return jsonify({"message": "系統錯誤", "error": str(e), "success": False}), 500
