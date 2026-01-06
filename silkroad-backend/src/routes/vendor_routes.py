from flask import Blueprint
from controllers import (
    update_products_listed,
    update_products,
    update_product,
    get_products,
    add_product,
    add_discount_policy,
    view_vendor_products,
    view_vendor_product_detail,
    view_discount_policy,
    invalid_discount_policy,
    update_discount_policy,
    get_public_vendors,
    update_vendor_description,
    update_vendor_manager_info,
    get_info,
    view_customer_discounts,
    update_vendor_logo,
    get_vendor_sales,
    add_single_option,
    delete_single_option
)
vendor_routes = Blueprint('vendor', __name__)
vendor_routes.route("/products/<int:product_id>", methods=["PATCH"])(update_product)
vendor_routes.route("/products/listed", methods=["PATCH"])(update_products_listed) #WIP same vendor check
vendor_routes.route("/products", methods=["PATCH"])(update_products) #WIP same vendor check
'''
前端給:
[
  {
    "product_id": 5, int
    "behavior": {
      "col_name": "price", str 標名
      "value": 65 型態依標名放
    }
  },
  {
    "product_id": 5,
    "behavior": {
      "col_name": "is_listed",
      "value": "true"
    }
  },
  {
    "product_id": 8,
    "behavior": {
      "col_name": "name",
      "value": "極致大杯珍珠奶茶"
    }
  }
]

回傳:
{
  "success": true,
  "message": "Product basic info updated successfully",
  "products": [
    {
      "id": 5, int
      "vendor_id": 1, int
      "name": "原本的名字", str
      "price": 65, int
      "description": "原本的描述", str
      "image_url": "http://...", url
      "is_listed": true, bool
      "created_at": "2026-01-05T22:00:00" str
    },
    {
      "id": 8,
      "vendor_id": 1,
      "name": "極致大杯珍珠奶茶",
      "price": 50,
      "description": "這杯很好喝",
      "image_url": "http://...",
      "is_listed": true,
      "created_at": "2026-01-05T22:05:00"
    }
  ]
}

'''


vendor_routes.route("/products", methods=["GET"])(get_products)
'''
回傳:
data.append({
            "id": p.id, int 
            "vendor_id": p.vendor_id, int
            "name": p.name, str
            "price": p.price, int
            "description": p.description, str
            "options": {
                "size": sizes_data,  sizes_data.append({"name": s_obj.options str, "price": int })
                "sugar": sugars, str
                "ice": ices, str
            },
            "price_step": step, int
            "image_url": p.image_url,
            "is_listed": p.is_listed, bool
        })
'''
vendor_routes.route("/product/add", methods=["POST"])(add_product)
'''
前端給:
required_fields = {
        "name": str,
        "price": int,
        "description": str,
        "image_url": str,
    }
'''
# """
# function:
#     增加product
    
# expected get:
# {
#     vendor_id: int,
#     name: string,
#     price: int,
#     description: string,
#     # is_listed: bool (true/false, default=True),
#     image_url: string,
#     sugar_options: string (separated by comma),
#     ice_options: string (separated by comma),
#     size_options: string (separated by comma)    
# }
# return:
# {
#     "message": "...",
#     "success": bool,
#     "product": { (if success)
#         "id": int,
#         "name": string,
#         "price": int
#     }
# }
# note:
#     sugar_options, ice_options, size_options should be strings separated by comma
#     eg. sugar_options="sugar1,sugar2,sugar3", 
#         ice_options="ice1,ice2,ice3", 
#         size_options="size1,size2,size3"
# """

# """
# function:
#     更新product(s)狀態

# expected get:
# [
#     {
#         "product_id": int,
#         "behavior": {
#             "col_name": string,
#             "value": string
#         }
#     },
#     ...
# ]

# return:
# (if successful)
# {
#     "message": "...",
#     "success": bool,
#     "Changed": [int] (if failed. id of Changed products),
#     "products": [
#         { 
#             "vendor_id": int,
#             "name": string,
#             "price": int,
#             "description": string,
#             "image_url": string,
#             "is_listed": bool,
#             "sugar_options": list[string],
#             "ice_options": list[string],
#             "size_options": list[string]
#         }
#     ]
        
# }

# (if failed)
# {
#     "message": "...",
#     "success": bool,
#     "Changed": list[int] (id of Changed products)
# }

# Note:
# col_name欄位只接受
#     name, price, description, image_url, is_listed,
#     sugar_options, ice_options, size_options
# 這個function會根據指定的col做調整，因此value 應該為string
# """
vendor_routes.route("/product/add_single_option", methods=["POST"])(add_single_option)
'''
前端給
{
    "product_id": int,
    "name": "大小", str
    "options": "L", str
    "price_step": 15 int(name 為 大小)才要
}
'''

vendor_routes.route("/product/delete_option", methods=["POST"])(delete_single_option)
'''
前端給:
{
    "product_id": 15, int
    "name": "糖度", str(記得給對)糖度, 冰量, 大小
    "options": "無糖" str
}
'''



vendor_routes.route("/<int:vendor_id>/view_products", methods=["GET"])(view_vendor_products)
'''
回傳範例:
{
  "message": "查詢成功",
  "success": true,
  "products": [
    {
      "id": 1, int
      "vendor_id": 101, int
      "name": "珍珠奶茶", str
      "base_price": 50, int
      "description": "經典濃郁奶茶搭配 Q 彈珍珠", str
      "image_url": "https://example.com/milktea.jpg", url
      "is_listed": true, bool 
      "options": {
        "size": [
          { "name": "中杯", "price": 50 },
          { "name": "大杯", "price": 65 }
        ],
        "sugar": ["全糖", "七分糖", "半糖", "微糖", "無糖"],
        "ice": ["正常冰", "少冰", "微冰", "去冰"]
      }
    },
    {
      "id": 2,
      "vendor_id": 101,
      "name": "茉莉綠茶",
      "base_price": 30,
      "description": "清新芳香的綠茶",
      "image_url": "https://example.com/greentea.jpg",
      "is_listed": true,
      "options": {
        "size": [
          { "name": "L", "price": 35 }
        ],
        "sugar": ["半糖", "無糖"],
        "ice": ["正常冰", "去冰"]
      }
    }
  ]
}

'''

vendor_routes.route("/<int:vendor_id>/sales_summary", methods=["GET"])(get_vendor_sales)
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
''' 更新後
後端給:
{
  "message": "find product success", 
  "success": true,
  "product": {
    "name": "波霸鮮奶茶", str
    "price": 60, int
    "image_url": "https://example.com/boba.jpg", url
    "description": "選用優質鮮奶與慢火熬煮波霸", str
    "sugar_option": [ 
      "全糖",
      "半糖",
      "微糖",
      "無糖"
    ],
    "ice_option": [
      "正常冰",
      "少冰",
      "去冰"
    ],
    "size_option": [
      {
        "name": "M",
        "price": 60
      },
      {
        "name": "L",
        "price": 75
      }
    ]
  }
}
'''



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

vendor_routes.route("/view_customer_discounts", methods=["GET"])(view_customer_discounts)
'''
需要{
    "customer_id": int
}

回傳

失敗
{
    "message": "找不到該客戶的會員資料 或 系統錯誤訊息",
    "success": False
}
or

成功
{
    "success": True,
    "user_current_level": 1,
    "count": 2,
    "data": [
        {
            "policy_id": int,
            "vendor_id": int,
            "vendor_name": str,
            "status": str, used or available
            "code": str,
            "type": str,
            "value": float,
            "min_purchase": int DEFAULT 0,
            "membership_limit": int DEFAULT 0,
            "expiry_date": str
        },
        {
            ......
        }
    ]
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

vendor_routes.route("/update_discount", methods=["POST"])(update_discount_policy)
'''
更新現有的折價券

需要{
"policy_id": int,
"vendor_id": int,
"code": string,
"type": string,
"value": int,
"min_purchase": int,
"max_discount": int,
"membership_limit": int,
"start_date": string,
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
{
    "policy_id": int,
    "message": "更新折價券成功",
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
            "email": string,
            "description": string
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

vendor_routes.route('/description', methods=['PATCH'])(update_vendor_description)
"""
Update Vendor Description
URL: /api/vendor/description
Method: PATCH
Header: Cookie (Session required, Role: 'vendor')
Body:
{
    "description": string (nullable)
}
Return:
{
    "success": true,
    "message": "Description updated successfully",
    "data": [{
        "id": int,
        "description": string
    }]
}
else:
{
    "message": "...",
    "success": False
}
"""

vendor_routes.route('/manager', methods=['PATCH'])(update_vendor_manager_info)
"""
Update Vendor Manager Info
URL: /api/vendor/manager
Method: PATCH
Header: Cookie (Session required, Role: 'vendor')
Body:
{
    "name": string,
    "email": string,
    "phone_number": string
}
Return:
{
    "success": true,
    "message": "Manager information updated successfully",
    "data": {
        "manager": {
            "id": int,
            "name": string,
            "email": string,
            "phone_number": string
        }
    }
}
else:
{
    "message": "Unauthorized" | "Missing manager info..." | "Vendor not found",
    "success": False
}
"""
vendor_routes.route('/logo', methods=['PATCH'])(update_vendor_logo)

vendor_routes.route('/<int:vendor_id>', methods=['GET'])(get_info)

vendor_routes.route("/sales_summary", methods=["GET"])(get_vendor_sales)
'''
expects
{
    "vendor_id": int
}
returns
{
    "message": String,
    "success": bool,
    "sales_summary": { (if successful)
        "total_sales": float,
        "total_orders": int,
        "top_selling_products": [
            {
                "product_id": int,
                "name": string,
                "units_sold": int,
                "revenue_generated": float
            },
            ...
        ],
        "sales_by_date": [
            {
                "date": string (YYYY-MM-DD),
                "total_sales": float,
                "total_orders": int
            },
            ...
        ]
    }
}
'''