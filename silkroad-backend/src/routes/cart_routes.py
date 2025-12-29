from controllers import (
    add_to_cart,
    add_to_cart_guest,
    remove_from_cart_guest,
    remove_from_cart,
    update_cart_item,
    view_cart,
    view_cart_guest
)
from utils import switcher
from flask import Blueprint

cart_routes = Blueprint("cart", __name__)


cart_routes.route('/add', methods=['POST'])(switcher(add_to_cart, add_to_cart_guest))
'''
需要{
"customer_id":int,  (if login)
"vendor_id":int,
"product_id":int,
"quantity": int,
"selected_sugar": str,
"selected_ice": str,
"selected_sizece": str
}

可能會回傳:
{
"message": "...",
"success": True/False
}
'''
cart_routes.route('/remove', methods=['POST'])(switcher(remove_from_cart, remove_from_cart_guest))
'''
需要{
" cart_item_id": int
}

可能會回傳:
{
"message": "...",
"success": True/False
}    
'''
cart_routes.route('/view/<int:cart_id>', methods=['GET'])(switcher(view_cart, view_cart_guest))
'''
需要{
"customer_id": int
}

可能會回傳:
---空購物車---
{
    "data": [],
    "message": "cart is empty",
    "success": True,
    "total_amount": 0
}

或    ---成功回傳---
{
    "data": result_list,
    "total_amount": total_price,
    "message": "cart item view",
    "success": True,
}

data包含

{
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
}
'''

cart_routes.route('/update', methods=['POST'])(update_cart_item)
'''
更新購物車項目的數量和/或客製化選項

需要{
    "cart_item_id": int (必需),
    "quantity": int (可選),
    "selected_sugar": str (可選),
    "selected_ice": str (可選),
    "selected_size": str (可選)
}

可能會回傳:
---成功---
{
    "message": "購物車項目更新成功",
    "success": True
}

---失敗---
{
    "message": "錯誤訊息",
    "success": False
}

注意: 至少需要提供一個更新欄位
'''
