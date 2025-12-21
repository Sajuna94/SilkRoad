from flask import Blueprint
from controllers import (
    update_products,
    add_product,
    add_discount_policy,
    view_vendor_products,
    view_vendor_product_detail,
    view_discount_policy,
    invalid_discount_policy,
    get_public_vendors
)
vendor_routes = Blueprint('vendor', __name__)

vendor_routes.route("/Add_Product", methods=["POST"])(add_product)
"""
function:
    增加product
    
expected get:
{
    vendor_id: int,
    name: string,
    price: int,
    description: string,
    is_listed: bool (true/false, default=True),
    image_url: string,
    sugar_options: string (separated by comma),
    ice_options: string (separated by comma),
    size_options: string (separated by comma)    
}
return:
{
    "message": "...",
    "success": bool,
    "product": { (if success)
        "id": int,
        "name": string,
        "price": int
    }
}
note:
    sugar_options, ice_options, size_options should be strings separated by comma
    eg. sugar_options="sugar1,sugar2,sugar3", 
        ice_options="ice1,ice2,ice3", 
        size_options="size1,size2,size3"
"""

vendor_routes.route("/update_products", methods=["PATCH"])(update_products) #WIP same vendor check
"""
function:
    更新product(s)狀態

expected get:
[
    {
        "product_id": int,
        "behavior": {
            "col_name": string,
            "value": string
        }
    },
    ...
]

return:
(if successful)
{
    "message": "...",
    "success": bool,
    "Changed": [int] (if failed. id of Changed products),
    "products": [
        { 
            "vendor_id": int,
            "name": string,
            "price": int,
            "description": string,
            "image_url": string,
            "is_listed": bool,
            "sugar_options": list[string],
            "ice_options": list[string],
            "size_options": list[string]
        }
    ]
        
}

(if failed)
{
    "message": "...",
    "success": bool,
    "Changed": list[int] (id of Changed products)
}

Note:
col_name欄位只接受
    name, price, description, image_url, is_listed,
    sugar_options, ice_options, size_options
這個function會根據指定的col做調整，因此value 應該為string
"""

vendor_routes.route("/<int:vendor_id>/view_products", methods=["GET"])(view_vendor_products)
"""
function:
    獲得vendor中所有product的簡單資訊狀態
    簡單資訊包括 id, name, price, image_url, is_listed
    用於當 customer 點擊 vendor 後進入用於陳列該店家所有product的頁面
    
expected get:
    No expected get

return:
{
    "message": String,
    "success": bool,
    "products": [ (if successful)
        {
            "id": int,
            "name": string,
            "price": int,
            "image_url": string,
            "is_listed": bool 
        },
        ...
    ]
}

"""

vendor_routes.route("/<int:vendor_id>/view_product_detail/<int:product_id>", methods=["GET"])(view_vendor_product_detail)
"""
function:
    獲得vendor中特定product的詳細資訊狀態
    詳細資訊包括 name, price, image_url, description, sugar_options, ice_options, size_options
    用於當 customer 點擊某特定product後顯示改product詳細資訊
    供客人選擇糖冰大小與數量以便加入cart
    
expected get:
    No expected get

return:
{
    "message": String,
    "success": bool,
    "product": (if successful)
        {
            "name": string,
            "price": int,
            "image_url": string,
            "description": string,
            "sugar_options": list[string],
            "ice_options": list[string],
            "size_options": list[string]
        }
}

"""

vendor_routes.route("/add_discount", methods=["POST"])(add_discount_policy)
'''
需要{
    "vendor_id": int,
    "type": string,
    "value": int,
    "min_purchase": int,
    "max_discount": int,
    "membership_limit": int,
    "expiry_date": string,
    }
'''

'''
回傳

失敗
{"message": "錯誤回報", 
"success": False}

or

成功
{"policy_id": add_discount_policy.id,
"message": "新增折價券成功",
"success": True}

'''

vendor_routes.route("/view_discount", methods=["POST"])(view_discount_policy)
'''
需要{
"vendor_id": int
}
'''

'''
回傳

失敗
{"message": "錯誤回報", 
"success": False}

or

成功
{
    "data": result_list,
    "policy_amount": policy_amount,
    "message": "discount_policies view",
    "success": True }

data包含

    {
    "policy_id": policy.id,
    "vendor_id": target_vendor_id,
    "is_available": policy.is_available,
    "type": str(policy.type),
    "value": policy.value,
    "min_purchase": policy.min_purchase,
    "max_discount": policy.max_discount,
    "membership_limit": policy.membership_limit,
    "expiry_date": formatted_date
    }

'''

vendor_routes.route("/invalid_discount", methods=["POST"])(invalid_discount_policy)
'''
直接更改折價券不是一件很好的方法
所以折價券有誤時，請先無效(停用)折價券，再做新的

需要{
"policy_id": int,
"vendor_id": int,
}
'''

'''
回傳

失敗
{"message": "錯誤回報", 
"success": False}

or

成功
{
    "message": "成功停用折價券",
    "success": True}

'''

vendor_routes.route('/vendors', methods=['GET'])(get_public_vendors)

"""
Get Public Vendors List
URL: /api/vendor/vendors
Method: GET
Header: None (No Cookie required)
Return:
{
    "success": true,
    "message": "...",
    "data": [
        {
            "id": int,
            "name": string,
            "address": string,
            "phone_number": string,
            "email": string
        },
        ...
    ]
}
else:
{
    "message": "...",
    "success": False
}
"""
