from flask import Blueprint
from controllers import update_products, add_product, add_discount_policy, get_vendor_products, view_discount_policy, invalid_discount_policy

vendor_routes = Blueprint('vendor', __name__)

vendor_routes.route("/Add_Product", methods=["POST"])(add_product)
"""
function:
    增加product
    
expected get:
{
    "vendor_id": int,
    "name": string,
    "price": int,
    "description": string,
    "image_url": string,
    "is_listed": bool (default=True)
}

return:
{
    "message": "...",
    "success": bool
    "product_id": int (is successful)
}
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
{
    "message": "...",
    "success": bool,
    "product": { (if successful)
        "vendor_id": int,
        "name": string,
        "price": int,
        "description": string,
        "image_url": string,
        "is_listed": bool 
    }
}        "vendor_id": int
Note:
col_name欄位只接受
name, price(Integer), description, image_url, is_listed(true/false)
這個function會根據指定的col做調整，因此value 應該為string
"""

vendor_routes.route("/<int:vendor_id>/get_products", methods=["GET"])(get_vendor_products)
"""
function:
    獲得vendor中所有products狀態
    
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
            "description": string,
            "image_url": string,
            "is_listed": bool 
        },
        ...
    ]
}

"""

# vendor_routes.route("/update_products", methods=["POST"])(update_products) #WIP same vendor check
"""
function:
    更新products

expected get:
[
    {
        "product_id": int,
    },
    ...
]

return:
{
    "message": String,
    "success": bool,
    "products": [ (if successful)
        {
            "id": int,
            "name": string,
            "price": int,
            "description": string,
            "image_url": string,
            "is_listed": bool 
        },
        ...
    ]
}

"""

vendor_routes.route("/add_discount", methods=["POST"])(add_discount_policy)
'''
需要{
    "vendor_id":XXX,
    "type":XXX,
    "value":XXX,
    "min_purchase":XXX,
    "max_discount":XXX,
    "membership_limit":XXX,
    "expiry_date":XXX,
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
"vendor_id":XXX
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
"policy_id":XXX,
"vendor_id": XXX,
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
