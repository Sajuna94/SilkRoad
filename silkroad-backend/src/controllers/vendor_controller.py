from flask import jsonify, request, session
from werkzeug.utils import secure_filename
import os
import uuid
from models import (
    Ice_Option,
    Sizes_Option,
    Sugar_Option,
    Vendor,
    Product,
    Discount_Policy,
    Vendor_Manager,
    Order,
    Customer,
    User,
    Review
)
from config.database import db
from utils import require_login

from datetime import datetime, date
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import joinedload
import pytz

# def allowed_file(filename):
#     return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_expiry_date(date_string):
    if not date_string:
        return None

    EXPECTED_FORMAT = "%Y-%m-%d"

    try:
        dt_object = datetime.strptime(date_string, EXPECTED_FORMAT)
        return dt_object.date()

    except ValueError:
        raise ValueError(f"日期格式錯誤。")


@require_login(role=["vendor"])
def update_products_listed():
    data: list = request.get_json() or []

    # 檢查 payload 是否為列表
    if not isinstance(data, list):
        return jsonify({
            "message": "Payload must be a list of products",
            "success": False,
        }), 400

    # 驗證每個產品的字段
    for item in data:
        if not isinstance(item, dict):
            return jsonify({
                "message": "Each item must be a dictionary",
                "success": False,
            }), 400

        if "product_id" not in item or "is_listed" not in item:
            return jsonify({
                "message": "Each item must have 'product_id' and 'is_listed'",
                "success": False,
            }), 400

        if not isinstance(item["product_id"], int):
            return jsonify({
                "message": "'product_id' must be an integer",
                "success": False,
            }), 400

        if not isinstance(item["is_listed"], bool):
            return jsonify({
                "message": "'is_listed' must be a boolean",
                "success": False,
            }), 400

    vendor_id = session["user_id"]

    try:
        # 批量更新
        for item in data:
            product = Product.query.filter_by(id=item["product_id"], vendor_id=vendor_id).first()
            if product:
                product.is_listed = item["is_listed"]
            else:
                return jsonify({
                    "message": f"Product with id {item['product_id']} not found for this vendor",
                    "success": False,
                }), 404

        db.session.commit()

        return jsonify({
            "message": "Products updated successfully",
            "success": True,
            "data": [{"product_id": item["product_id"], "is_listed": item["is_listed"]} for item in data]
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Failed to update products: {str(e)}",
            "success": False,
        }), 500
    
'''
@require_login(role=["vendor"])
def get_products():
    vendor_id = session.get("user_id")
    products = (
        Product.query
        .options(
            joinedload(Product.sizes_option),
            joinedload(Product.sugar_option),
            joinedload(Product.ice_option),
        )
        .filter_by(vendor_id=vendor_id)
        .all()
    )
    data = []

    for p in products:
        # 1. 取得 step
        step = p.sizes_option.price_step if p.sizes_option else 0 

        sizes = [s.strip() for s in (p.sizes_option.options.split(",") if p.sizes_option else []) if s.strip()]
        sugars = [s.strip() for s in (p.sugar_option.options.split(",") if p.sugar_option else []) if s.strip()]
        ices = [s.strip() for s in (p.ice_option.options.split(",") if p.ice_option else []) if s.strip()]

        # 2. 計算顯示用的價格 (給前端選單顯示用)
        sizes_data = []
        for index, name in enumerate(sizes):
            sizes_data.append({
                "name": name,
                "price": index * step 
            })

        data.append({
            "id": p.id,
            "vendor_id": p.vendor_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "options": {
                "size": sizes_data,
                "sugar": sugars,
                "ice": ices,
            },
            # [重要修改] 必須把 price_step 回傳，ProductEditModal 才抓得到目前的設定值
            "price_step": step, 
            "image_url": p.image_url,
            "is_listed": p.is_listed,
        })

    return jsonify({"message": "", "success": True, "products": data})

'''

@require_login(role=["vendor"])# c
def get_products():
    vendor_id = session.get("user_id")
    products = (
        Product.query
        .options(
            joinedload(Product.sizes_options), # 注意：這裏建議用複數，對應 relationship 名稱
            joinedload(Product.sugar_options),
            joinedload(Product.ice_options),
        )
        .filter_by(vendor_id=vendor_id)
        .all()
    )
    data = []

    for p in products:
        # --- 1. 取得排序後的選項列表 (由舊到新) ---
        # 使用 sorted 並根據 created_at 排序
        sorted_sizes = sorted(p.sizes_options, key=lambda x: x.created_at)
        sorted_sugars = sorted(p.sugar_options, key=lambda x: x.created_at)
        sorted_ices = sorted(p.ice_options, key=lambda x: x.created_at)

        # --- 2. 提取屬性 ---
        # 取得第一個尺寸的 price_step 作為代表 (若無則 0)
        step = sorted_sizes[0].price_step if sorted_sizes else 0 

        # 收集選項名稱字串
        sugars = [s.options for s in sorted_sugars]
        ices = [i.options for i in sorted_ices]

        # --- 3. 計算顯示用的價格 (保留原本 index * step 的邏輯) ---
        sizes_data = []
        for index, s_obj in enumerate(sorted_sizes):
            sizes_data.append({
                "name": s_obj.options,
                "price": p.price + s_obj.price_step
            })

        data.append({
            "id": p.id,
            "vendor_id": p.vendor_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "options": {
                "size": sizes_data,
                "sugar": sugars,
                "ice": ices,
            },
            "price_step": step, 
            "image_url": p.image_url,
            "is_listed": p.is_listed,
        })

    return jsonify({"message": "", "success": True, "products": data})


'''
@require_login(role=["vendor"])
def add_product():
    data: dict = request.get_json() or {}

    # Define required top-level fields and types
    required_fields = {
        "name": str,
        "price": int,
        "description": str,
        "options": dict,
        "image_url": str,
    }

    # Check missing fields and top-level types
    for field, field_type in required_fields.items():
        if field not in data:
            return jsonify({
                "message": f"Missing required field: {field}", 
                "success": False
            }), 400
        if not isinstance(data[field], field_type):
            return jsonify({
                "message": f"Invalid type for {field}: expected {field_type.__name__}",
                "success": False
            }), 400
            

    # Validate 'options' subfields
    options: dict = data["options"]
    options_required = ["size", "ice", "sugar"]

    for key in options_required:
        if key not in options:
            return jsonify({
                "message": f"Missing '{key}' in options",
                "success": False
            }), 400

        # 注意：size 若包含價格邏輯，這裡可能還是存逗號分隔字串
        if not isinstance(options[key], str):
            return jsonify({
                "message": f"'{key}' must be a string of comma-separated values",
                "success": False
            }), 400

    # 讀取 price_step，若無則預設 0
    price_step = options.get("price_step", 0)
    try:
        price_step = int(price_step)
    except ValueError:
        return jsonify({"message": "price_step must be an integer", "success": False}), 400

    # Convert comma-separated string to list for storage
    for key in options_required:
        options[key] = [opt.strip() for opt in options[key].split(",") if opt.strip()]

    vendor_id = session["user_id"]
    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({
            "message": f"Vendor with id {vendor_id} not found",
            "success": False
            }), 404

    # ===== 創建產品 =====
    new_product = Product(
        vendor_id=vendor_id,
        name=data.get("name"),
        price=data.get("price"),
        description=data.get("description"),
        is_listed=False,
        image_url=data.get("image_url"),
    )

    try:
        db.session.add(new_product)
        db.session.flush()

        db.session.add_all([
            Sugar_Option(product_id=new_product.id, options=",".join(options["sugar"])),
            Ice_Option(product_id=new_product.id, options=",".join(options["ice"])),
            # [修改] 這裡加入 price_step
            Sizes_Option(
                product_id=new_product.id, 
                options=",".join(options["size"]),
                price_step=price_step
            ),
        ])
        db.session.commit()

        return jsonify({
            "message": "Product added successfully",
            "success": True,
            "data": {
                "id": new_product.id,
                "name": new_product.name,
                "price": new_product.price,
            },
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Failed to add product: {str(e)}", 
            "success": False
        }), 500

'''
@require_login(role=["vendor"]) #c
def add_product():
    data: dict = request.get_json() or {}

    # 1. 定義產品基本屬性與類型檢查
    required_fields = {
        "name": str,
        "price": int,
        "description": str,
        "image_url": str,
    }

    # 2. 驗證必要欄位
    for field, field_type in required_fields.items():
        if field not in data:
            return jsonify({"message": f"Missing field: {field}", "success": False}), 400
        if not isinstance(data[field], field_type):
            return jsonify({"message": f"Invalid type for {field}", "success": False}), 400

    vendor_id = session.get("user_id")

    # 3. 創建並保存產品主體
    try:
        new_product = Product(
            vendor_id=vendor_id,
            name=data.get("name"),
            price=data.get("price"),
            description=data.get("description"),
            image_url=data.get("image_url"),
            is_listed=False  # 預設為下架狀態
        )

        db.session.add(new_product)
        db.session.commit()

        return jsonify({
            "message": "Product created successfully (without options)",
            "success": True,
            "data": {
                "id": new_product.id,
                "name": new_product.name
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Failed to save product: {str(e)}", 
            "success": False
        }), 500
    
@require_login(role=["vendor"])#c
def add_single_option(): # 路由函式通常不帶參數
    data: dict = request.get_json() or {}
    
    product_id = data.get("product_id")
    category = data.get("name")      # "糖度", "冰量", "大小"
    option_val = data.get("options")
    price_step = data.get("price_step", 0)

    # --- 1. 基本欄位檢查 ---
    if not all([product_id, category, option_val]):
        return jsonify({"message": "缺少必要欄位", "success": False}), 400

    # --- 2. 安全性檢查：確保該產品屬於當前登入的商家 ---
    vendor_id = session.get("user_id")
    product = Product.query.filter_by(id=product_id, vendor_id=vendor_id).first()
    if not product:
        return jsonify({"message": "查無此產品或權限不足", "success": False}), 404

    try:
        # --- 3. 根據類別新增選項 ---
        if category == "糖度":
            new_opt = Sugar_Option(product_id=product_id, options=option_val)
            db.session.add(new_opt)
            
        elif category == "冰量":
            new_opt = Ice_Option(product_id=product_id, options=option_val)
            db.session.add(new_opt)
            
        elif category == "大小":
            new_opt = Sizes_Option(
                product_id=product_id, 
                options=option_val, 
                price_step=int(price_step) # 確保轉為整數
            )
            db.session.add(new_opt)
        
        else:
            return jsonify({"message": f"不支援的類別: {category}", "success": False}), 400

        db.session.commit()
        return jsonify({
            "message": f"成功新增{category}選項: {option_val}",
            "success": True,
        }), 201

    except Exception as e:
        db.session.rollback()
        # 若發生 Duplicate Entry (重複新增同一選項)，會跳到這裡
        return jsonify({
            "message": f"儲存失敗 (可能是重複的選項): {str(e)}", 
            "success": False
        }), 500

'''
@require_login(role=["vendor"])
def update_products():
    data = request.get_json()

    if not data or not isinstance(data, list):
        return jsonify({
            "message": "Expected a non-empty list",
            "success": False
        }), 400

    MUTABLE_FIELDS = {
        "name", "price", "description", "is_listed", "image_url",
        "sugar_options", "ice_options", "size_options", "price_step"
    }

    updated_products = []

    for item in data:
        product_id = item.get("product_id")
        behavior = item.get("behavior", {})
        col_name = behavior.get("col_name")
        value = behavior.get("value")

        if not product_id or not col_name or value is None:
            return jsonify({
                "message": "Missing required fields",
                "success": False
            }), 400

        if col_name not in MUTABLE_FIELDS:
            return jsonify({
                "message": f"Column '{col_name}' is immutable",
                "success": False
            }), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "message": f"Product with id {product_id} not found",
                "success": False
            }), 404

        try:
            if col_name == "price":
                setattr(product, col_name, int(value))
            elif col_name == "is_listed":
                setattr(product, col_name, str(value).lower() == "true")
            elif "options" in col_name:
                value_list = [v.strip() for v in str(value).split(",") if v.strip()]

                if col_name == "size_options":
                    option_attr_name = "sizes_option"
                else:
                    option_attr_name = col_name.replace("_options", "_option")

                option_obj = getattr(product, option_attr_name, None)
                
                # [修改] 如果沒有找到選項物件，則回傳錯誤 (不自動建立)
                if not option_obj:
                    return jsonify({
                        "message": f"Product {product_id} has no {option_attr_name}",
                        "success": False
                    }), 400
                
                option_obj.set_options_list(value_list)

            elif col_name == "price_step":

                product.sizes_option.price_step = int(value)
            
                db.session.add(product.sizes_option)

            else:
                setattr(product, col_name, value)
        except ValueError:
            db.session.rollback()
            return jsonify({
                "message": f"Invalid value for {col_name}",
                "success": False
            }), 400

        updated_products.append(product)

    try:
        db.session.commit()
        products_data = [
            {
                "id": p.id,
                "vendor_id": p.vendor_id,
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "image_url": p.image_url,
                "is_listed": p.is_listed,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "sugar_options": p.sugar_option.get_options_list() if p.sugar_option else None,
                "ice_options": p.ice_option.get_options_list() if p.ice_option else None,
                "size_options": p.sizes_option.get_options_list() if p.sizes_option else None,
                # 確認回傳的是更新後的值
                "price_step": p.sizes_option.price_step if p.sizes_option else 0
            }
            for p in updated_products
        ]
        return jsonify({
            "message": "Product updated successfully",
            "success": True,
            "products": products_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500
'''

@require_login(role=["vendor"]) #c
def update_products():
    data = request.get_json()

    if not data or not isinstance(data, list):
        return jsonify({
            "message": "Expected a non-empty list",
            "success": False
        }), 400

    # 移除所有選項相關欄位，僅保留產品主表屬性
    MUTABLE_FIELDS = {
        "name", "price", "description", "is_listed", "image_url"
    }

    updated_products = []

    for item in data:
        product_id = item.get("product_id")
        behavior = item.get("behavior", {})
        col_name = behavior.get("col_name")
        value = behavior.get("value")

        if not product_id or not col_name or value is None:
            return jsonify({
                "message": "Missing required fields",
                "success": False
            }), 400

        if col_name not in MUTABLE_FIELDS:
            return jsonify({
                "message": f"Column '{col_name}' is immutable or handled by other API",
                "success": False
            }), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "message": f"Product with id {product_id} not found",
                "success": False
            }), 404

        try:
            if col_name == "price":
                setattr(product, col_name, int(value))
            elif col_name == "is_listed":
                # 確保布林值正確轉換
                setattr(product, col_name, str(value).lower() == "true")
            else:
                setattr(product, col_name, value)
        except ValueError:
            db.session.rollback()
            return jsonify({
                "message": f"Invalid value for {col_name}",
                "success": False
            }), 400

        updated_products.append(product)

    try:
        db.session.commit()
        # 回傳資料也精簡為基本屬性
        products_data = [
            {
                "id": p.id,
                "vendor_id": p.vendor_id,
                "name": p.name,
                "price": p.price,
                "description": p.description,
                "image_url": p.image_url,
                "is_listed": p.is_listed,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in updated_products
        ]
        return jsonify({
            "message": "Product basic info updated successfully",
            "success": True,
            "products": products_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500

@require_login(role=["vendor"]) #c
def delete_single_option():
    """
    刪除單一選項
    前端傳入格式: {"product_id": 1, "name": "糖度", "options": "70%"}
    """
    data: dict = request.get_json() or {}
    
    product_id = data.get("product_id")
    category = data.get("name")      # "糖度", "冰量", "大小"
    option_val = data.get("options") # 具體的選項名稱，例如 "70%" 或 "L"

    # 1. 基本檢查
    if not all([product_id, category, option_val]):
        return jsonify({"message": "缺少必要欄位", "success": False}), 400

    # 2. 安全檢查：確保該產品屬於當前登入的商家
    vendor_id = session.get("user_id")
    product = Product.query.filter_by(id=product_id, vendor_id=vendor_id).first()
    if not product:
        return jsonify({"message": "查無此產品或權限不足", "success": False}), 404

    try:
        # 3. 根據類別執行刪除
        if category == "糖度":
            target = Sugar_Option.query.filter_by(product_id=product_id, options=option_val).first()
        elif category == "冰量":
            target = Ice_Option.query.filter_by(product_id=product_id, options=option_val).first()
        elif category == "大小":
            target = Sizes_Option.query.filter_by(product_id=product_id, options=option_val).first()
        else:
            return jsonify({"message": f"不支援的類別: {category}", "success": False}), 400

        # 4. 判斷是否存在並執行
        if not target:
            return jsonify({"message": "找不到該選項，可能已被刪除", "success": False}), 404

        db.session.delete(target)
        db.session.commit()

        return jsonify({
            "message": f"已成功刪除{category}選項: {option_val}",
            "success": True,
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"刪除失敗: {str(e)}", 
            "success": False
        }), 500

'''
def view_vendor_products(vendor_id):
    # ... (前面的查詢邏輯保持不變) ...
    products = (
        Product.query
        .options(
            joinedload(Product.sizes_option),
            joinedload(Product.sugar_option),
            joinedload(Product.ice_option),
        )
        .filter_by(vendor_id=vendor_id)
        .all()
    )
    data = []

    for p in products:
        # --- 修改開始 ---
        raw_sizes = [s.strip() for s in (p.sizes_option.options.split(",") if p.sizes_option else []) if s.strip()]
        sizes_data = []
        for index, name in enumerate(raw_sizes):
            sizes_data.append({
                "name": name,
                "price": index * p.sizes_option.price_step  # 固定加價邏輯
            })
        # --- 修改結束 ---

        sugars = [s.strip() for s in (p.sugar_option.options.split(",") if p.sugar_option else []) if s.strip()]
        ices = [s.strip() for s in (p.ice_option.options.split(",") if p.ice_option else []) if s.strip()]

        data.append({
            "id": p.id,
            "vendor_id": p.vendor_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "options": {
                "size": sizes_data,
                "sugar": sugars,
                "ice": ices,
            },
            "image_url": p.image_url,
            "is_listed": p.is_listed,
        })

    return jsonify({"message": "", "success": True, "products": data})

        # products = Product.query.filter_by(vendor_id=vendor_id).all()
        # print(products)
        # if not products:
        #     return (
        #         jsonify(
        #             {
        #                 "message": "No products found for this vendor",
        #                 "success": True,
        #                 "products": [],
        #             }
        #         ),
        #         200,
        #     )

        # # 準備回傳的產品資訊
        # products_data = []
        # for product in products:
        #     products_data.append(
        #         {
        #             "id": product.id,
        #             "name": product.name,
        #             "price": product.price,
        #             "image_url": product.image_url,
        #             "is_listed": product.is_listed,
        #         }
        #     )

        # return (
        #     jsonify(
        #         {
        #             "message": "Vendor products retrieved successfully",
        #             "success": True,
        #             "products": products_data,
        #         }
        #     ),
        #     200,
        # )
    # except Exception as e:
    #     return (
    #         jsonify(
    #             {
    #                 "message": f"Failed to retrieve vendor products: {str(e)}",
    #                 "success": False,
    #             }
    #         ),
    #         500,
    #     )
'''

def view_vendor_products(vendor_id): #c
    try:
        # 1. 執行資料庫查詢
        products = (
            Product.query
            .options(
                joinedload(Product.sizes_options),
                joinedload(Product.sugar_options),
                joinedload(Product.ice_options),
            )
            .filter_by(vendor_id=vendor_id)
            .all()
        )
        
        data = []

        # 2. 解析資料
        for p in products:
            # 取得排序後的選項清單 (由舊到新)
            sorted_sizes = sorted(p.sizes_options, key=lambda x: x.created_at)
            sorted_sugars = sorted(p.sugar_options, key=lambda x: x.created_at)
            sorted_ices = sorted(p.ice_options, key=lambda x: x.created_at)

            # --- 修改部分：處理尺寸與「原價 + 加價」的邏輯 ---
            sizes_data = []
            for s_obj in sorted_sizes:
                sizes_data.append({
                    "name": s_obj.options,
                    # 計算方式：產品基本價 (p.price) + 該尺寸的加價 (s_obj.price_step)
                    "price": p.price + s_obj.price_step 
                })
            # ------------------------------------------

            # 處理糖度與冰量字串清單
            sugars = [s.options for s in sorted_sugars]
            ices = [i.options for i in sorted_ices]

            # 組合產品資料
            data.append({
                "id": p.id,
                "vendor_id": p.vendor_id,
                "name": p.name,
                "price": p.price, # 建議回傳一個原價欄位，方便前端比對
                "description": p.description,
                "options": {
                    "size": sizes_data,
                    "sugar": sugars,
                    "ice": ices,
                },
                "image_url": p.image_url,
                "is_listed": p.is_listed,
            })

        return jsonify({
            "message": "查詢成功",
            "success": True,
            "products": data
        }), 200

    except Exception as e:
        print(f"Error in view_vendor_products: {str(e)}")
        return jsonify({
            "message": f"伺服器錯誤: {str(e)}",
            "success": False
        }), 500

'''
def view_vendor_product_detail(vendor_id, product_id):
    try:
        # ... (前面的查詢與檢查邏輯保持不變) ...
        vendor = Vendor.query.get(vendor_id)
        # ...
        product = Product.query.get(product_id)
        if not product:
             return jsonify({"message": "Product not found", "success": True, "products": []}), 404
        
        # --- 修改開始：處理單一商品的尺寸加價 ---
        raw_sizes = []
        if product.sizes_option:
             raw_sizes = [s.strip() for s in product.sizes_option.options.split(",") if s.strip()]
        
        sizes_data = []
        for index, name in enumerate(raw_sizes):
            sizes_data.append({
                "name": name,
                "price": index * product.sizes_option.price_step
            })
        # --- 修改結束 ---

        return (
            jsonify(
                {
                    "message": "find product success",
                    "success": True,
                    "product": {
                        "name": product.name,
                        "price": product.price,
                        "image_url": product.image_url,
                        "description": product.description,
                        "sugar_option": product.sugar_option.get_options_list(),
                        "ice_option": product.ice_option.get_options_list(),
                        "size_option": sizes_data, # 這裡回傳含有價格的結構
                        "price_step": product.sizes_option.price_step if product.sizes_option else 0,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"message": f"Fail with {str(e)}", "success": False}), 500
'''

def view_vendor_product_detail(vendor_id, product_id): #c
    try:
        # ... (前面檢查邏輯保持不變) ...
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"message": "Product not found", "success": False, "products": []}), 404
        
        # --- 修改開始：處理單一商品的尺寸加價與選項收集 ---
        # 1. 取得排序後的選項清單 (由舊到新)
        sorted_sizes = sorted(product.sizes_options, key=lambda x: x.created_at)
        sorted_sugars = sorted(product.sugar_options, key=lambda x: x.created_at)
        sorted_ices = sorted(product.ice_options, key=lambda x: x.created_at)

        # 2. 計算每個尺寸的最終價格 (原價 + 各別加價)
        sizes_data = []
        for s in sorted_sizes:
            sizes_data.append({
                "name": s.options,
                "price": product.price + s.price_step  # 修改這裡：原價 + 該尺寸加價
            })
        # --- 修改結束 ---

        return jsonify({
            "message": "find product success",
            "success": True,
            "product": {
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url,
                "description": product.description,
                # 直接從排序後的物件提取名稱
                "sugar_option": [s.options for s in sorted_sugars],
                "ice_option": [i.options for i in sorted_ices],
                "size_option": sizes_data
            },
        }), 200

    except Exception as e:
        return jsonify({"message": f"Fail with {str(e)}", "success": False}), 500

@require_login(role=["vendor"])
def add_discount_policy():
    data = request.get_json()

    """
    預計傳給我{
    "vendor_id":XXX,
    "code":XXX,
    "type":XXX,
    "value":XXX,
    "min_purchase":XXX,
    "max_discount":XXX,
    "membership_limit":XXX,
    "start_date":XXX,
    "expiry_date":XXX,
    }
    """

    if not data:
        return jsonify({"message": "無效的請求數據", "success": False}), 400

    vendor_id = data.get("vendor_id")

    if not vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400
    try:
        vendor_exists = db.session.query(Vendor).get(vendor_id)
        if vendor_exists is None:
            return jsonify({"message": "無效的 vendor_id", "success": False}), 400
    except Exception:
        return (
            jsonify({"message": "系統錯誤，無法驗證 vendor_id", "success": False}),
            500,
        )

    code = data.get("code")
    type_val = data.get("type")
    value = data.get("value")
    membership_limit = data.get("membership_limit")
    min_purchase = data.get("min_purchase")
    max_discount = data.get("max_discount")

    if type_val is None or value is None or membership_limit is None:
        return (
            jsonify(
                {
                    "message": "type, value, membership_limit 不可為空或 None",
                    "success": False,
                }
            ),
            400,
        )

    try:
        value = int(value)
        membership_limit = int(membership_limit)
    except (ValueError, TypeError):
        return (
            jsonify(
                {
                    "message": "invalid value type for: 'value', 'membership_limit'",
                    "success": False,
                }
            ),
            400,
        )

    # check enum
    if type_val != "percent" and type_val != "fixed":
        return (
            jsonify({"message": "invalid value type for: 'type'", "success": False}),
            400,
        )

    # check value
    if type_val == "percent":
        if value < 0:
            return (
                jsonify(
                    {
                        "message": "percent value must be greater than or equal to 0",
                        "success": False,
                    }
                ),
                400,
            )
        if value >= 100:
            return (
                jsonify(
                    {"message": "percent value must be less than 100", "success": False}
                ),
                400,
            )

    if type_val == "fixed":
        if min_purchase is None:
            return (
                jsonify(
                    {
                        "message": "min_purchase is required for fixed type",
                        "success": False,
                    }
                ),
                400,
            )
        try:
            min_purchase = int(min_purchase)
        except (ValueError, TypeError):
            return (
                jsonify(
                    {
                        "message": "invalid value type for: 'min_purchase'",
                        "success": False,
                    }
                ),
                400,
            )

        if value < 0:
            return (
                jsonify(
                    {
                        "message": "fixed value must be greater than or equal to 0",
                        "success": False,
                    }
                ),
                400,
            )
        if min_purchase < 0:
            return (
                jsonify(
                    {
                        "message": "min_purchase must be greater than or equal to 0",
                        "success": False,
                    }
                ),
                400,
            )
        if min_purchase <= value:
            return (
                jsonify(
                    {
                        "message": "min_purchase must be greater than fixed value",
                        "success": False,
                    }
                ),
                400,
            )

    # Validate code length and format
    if code:
        if len(code) > 20:
            return jsonify({"message": "折價碼長度不能超過 20 個字元", "success": False}), 400
        if len(code) < 3:
            return jsonify({"message": "折價碼長度至少需要 3 個字元", "success": False}), 400

        # Check if code already exists for this vendor
        existing_code = Discount_Policy.query.filter_by(
            vendor_id=vendor_id, code=code
        ).first()
        if existing_code:
            return jsonify({"message": "折價碼已存在，請使用其他代碼", "success": False}), 400

    # Parse start_date
    start_date_str = data.get("start_date")
    parsed_start_date = None

    if start_date_str:
        try:
            parsed_start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "開始日期格式錯誤", "success": False}), 400

    # Parse expiry_date
    expiry_date_str = data.get("expiry_date")
    parsed_expiry_date = None

    if expiry_date_str:
        try:
            parsed_expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "結束日期格式錯誤", "success": False}), 400

    # Validate date range
    if parsed_start_date and parsed_expiry_date:
        if parsed_expiry_date < parsed_start_date:
            return jsonify({"message": "結束日期不能早於開始日期", "success": False}), 400

    try:
        add_discount_policy = Discount_Policy(
            vendor_id=vendor_id,
            code=code,
            type=type_val,
            is_available=True,
            value=value,
            membership_limit=membership_limit,
            start_date=parsed_start_date,
            expiry_date=parsed_expiry_date,
        )

        if min_purchase is not None and min_purchase != 0:
            add_discount_policy.min_purchase = min_purchase

        if max_discount is not None:
            add_discount_policy.max_discount = max_discount

        db.session.add(add_discount_policy)
        db.session.commit()

        return (
            jsonify(
                {
                    "policy_id": add_discount_policy.id,
                    "message": "新增折價券成功",
                    "success": True,
                }
            ),
            201,
        )
    except ValueError as e:
        db.session.rollback()
        return jsonify({"message": f"資料驗證錯誤：{str(e)}", "success": False}), 400
    except Exception as e:
        db.session.rollback()
        # 檢查是否是數據庫約束錯誤
        error_msg = str(e).lower()
        if "duplicate" in error_msg or "unique" in error_msg:
            return jsonify({"message": "折價碼已存在，請使用其他代碼", "success": False}), 400
        elif "data too long" in error_msg:
            return jsonify({"message": "輸入的資料過長，請檢查所有欄位", "success": False}), 400
        elif "foreign key" in error_msg:
            return jsonify({"message": "商家 ID 無效", "success": False}), 400
        else:
            # 記錄詳細錯誤到伺服器日誌
            return jsonify({"message": "新增折價券失敗，請稍後再試", "success": False}), 500


@require_login(role=["vendor"])
def view_discount_policy():
    data = request.get_json()
    """
    預計傳給我{
    "vendor_id":XXX,
    }
    """
    if not data:
        return jsonify({"message": "無效的請求數據", "success": False}), 400

    target_vendor_id = data.get("vendor_id")

    if not target_vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400
    try:
        vendor_exists = Vendor.query.get(target_vendor_id)
        if vendor_exists is None:
            return jsonify({"message": "無效的 vendor_id", "success": False}), 400
    except Exception:
        return (
            jsonify({"message": "系統錯誤，無法驗證 vendor_id", "success": False}),
            500,
        )

    try:
        policies = Discount_Policy.query.filter_by(vendor_id=target_vendor_id).all()

        result_list = []
        policy_amount = len(policies)

        for policy in policies:
            formatted_start_date = (
                policy.start_date.isoformat() if policy.start_date else None
            )
            formatted_expiry_date = (
                policy.expiry_date.isoformat() if policy.expiry_date else None
            )

            result_list.append(
                {
                    "policy_id": policy.id,
                    "vendor_id": target_vendor_id,
                    "code": policy.code,
                    "is_available": policy.is_available,
                    "type": str(policy.type),
                    "value": policy.value,
                    "min_purchase": policy.min_purchase,
                    "max_discount": policy.max_discount,
                    "membership_limit": policy.membership_limit,
                    "start_date": formatted_start_date,
                    "expiry_date": formatted_expiry_date,
                }
            )

        return jsonify(
            {
                "data": result_list,
                "policy_amount": policy_amount,
                "message": "discount_policies view",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": "系統錯誤", "error": str(e)}), 500

@require_login(role=["customer"])
def view_customer_discounts():
    customer_id = session.get("user_id")
    if not customer_id:
        return jsonify({"message": "缺少 customer_id", "success": False}), 400

    tw_tz = pytz.timezone('Asia/Taipei')
    today = datetime.now(tw_tz).date()

    try:
        # 1. 獲取該用戶目前的會員等級
        customer_info = Customer.query.filter_by(user_id=customer_id).first()
        if not customer_info:
            return jsonify({"message": "找不到該客戶的會員資料", "success": False}), 404
        user_level = customer_info.membership_level

        # 2. 獲取該用戶的使用紀錄
        used_policies_query = db.session.query(Order.policy_id).filter(
            Order.user_id == customer_id,
            Order.policy_id.isnot(None),
            or_(Order.refund_status.is_(None), Order.refund_status != 'refunded')
        ).distinct().all()
        used_ids = [row[0] for row in used_policies_query]

        # 3. 查詢所有優惠券 (不再於資料庫階段過濾等級與日期)
        # 只過濾掉被管理員完全關閉 (is_available=False) 的券
        # 同時過濾掉被 ban 或未驗證的 vendor 的券
        query = db.session.query(Discount_Policy, Vendor.name).join(
            Vendor, Discount_Policy.vendor_id == Vendor.id
        ).filter(
            Discount_Policy.is_available == True,
            Vendor.is_active == True,  # 只顯示活躍 vendor 的券
            Vendor.is_verified == True  # 只顯示已驗證 vendor 的券
        )

        policies_with_names = query.all()

        # 4. 格式化並判斷狀態
        result = []
        for policy, vendor_name in policies_with_names:
            # 判斷是否符合條件 (等級與日期)
            is_expired = policy.expiry_date and policy.expiry_date < today
            is_not_started = policy.start_date and policy.start_date > today
            level_not_met = policy.membership_limit > user_level
            is_used = policy.id in used_ids
            
            # 建議補充：如果 expiry_date 為 None，仍要檢查 start_date 是否大於今天。
            # # 判斷是否符合條件 (等級與日期)
            # if policy.expiry_date:
            #     is_expired = policy.expiry_date < today
            # else:
            #     is_expired = False  # 永久有效不算過期

            # # 即使 expiry_date 為 None，也要檢查 start_date
            # is_not_started = policy.start_date and policy.start_date > today
            # level_not_met = policy.membership_limit > user_level

            if is_expired and not is_used:
                continue

            # 核心狀態判斷邏輯
            if policy.id in used_ids:
                status = "used"
            elif is_expired or is_not_started or level_not_met:
                status = "disabled"
            else:
                status = "available"

            result.append({
                "policy_id": policy.id,
                "vendor_id": policy.vendor_id,  # 添加 vendor_id
                "vendor_name": vendor_name,
                "code": policy.code,
                "type": policy.type,
                "value": policy.value,
                "min_purchase": policy.min_purchase,
                "max_discount": policy.max_discount,  # 添加 max_discount
                "membership_limit": policy.membership_limit,
                "expiry_date": str(policy.expiry_date) if policy.expiry_date else "永久有效",
                "status": status,
                # 額外回傳不符合的原因，方便前端顯示（可選）
                "disable_reason": "等級不足" if level_not_met else "已過期/尚未開始" if (is_expired or is_not_started) else None
            })

        # 5. 自定義排序邏輯
        # 權重分配：available=0, used=1, disabled=2
        status_weight = {"available": 0, "used": 1, "disabled": 2}
        result.sort(key=lambda x: status_weight[x['status']])

        return jsonify({
            "success": True,
            "user_current_level": user_level,
            "count": len(result),
            "data": result
        }), 200

    except Exception as e:
        return jsonify({"message": "系統錯誤", "error": str(e), "success": False}), 500
    
def invalid_discount_policy():
    data = request.get_json()
    """
    預計傳給我{
    "policy_id":XXX,
    "vendor_id": XXX,
    }
    """

    if not data:
        return jsonify({"message": "無效的請求數據", "success": False}), 400

    target_policy_id = data.get("policy_id")
    target_vendor_id = data.get("vendor_id")

    if not target_policy_id or not target_vendor_id:
        return (
            jsonify({"message": "缺少 policy_id 或 vendor_id", "success": False}),
            400,
        )

    try:
        vendor_exists = Vendor.query.get(target_vendor_id)
        if vendor_exists is None:
            return jsonify({"message": "無效的 vendor_id", "success": False}), 400

        policy = Discount_Policy.query.get(target_policy_id)

        if policy is None:
            return jsonify({"message": "無效的 policy_id", "success": False}), 404

        if target_vendor_id != policy.vendor_id:
            return jsonify({"message": "vendor_id不相符", "success": False}), 403

        policy.is_available = False
        db.session.commit()

        return jsonify({"message": "成功停用折價券", "success": True}), 200

    except Exception as e:
        db.session.rollback()
        return (
            jsonify(
                {"message": "系統錯誤，停用失敗", "error": str(e), "success": False}
            ),
            500,
        )


@require_login(role=["vendor"])
def update_discount_policy():
    data = request.get_json()

    """
    預計傳給我{
    "policy_id":XXX,
    "vendor_id":XXX,
    "code":XXX,
    "type":XXX,
    "value":XXX,
    "min_purchase":XXX,
    "max_discount":XXX,
    "membership_limit":XXX,
    "start_date":XXX,
    "expiry_date":XXX,
    }
    """

    if not data:
        return jsonify({"message": "無效的請求數據", "success": False}), 400

    policy_id = data.get("policy_id")
    vendor_id = data.get("vendor_id")

    if not policy_id:
        return jsonify({"message": "缺少 policy_id", "success": False}), 400
    if not vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400

    try:
        # 檢查 vendor 是否存在
        vendor_exists = db.session.query(Vendor).get(vendor_id)
        if vendor_exists is None:
            return jsonify({"message": "無效的 vendor_id", "success": False}), 400

        # 獲取要更新的折價券
        policy = Discount_Policy.query.get(policy_id)
        if policy is None:
            return jsonify({"message": "找不到該折價券", "success": False}), 404

        # 驗證折價券屬於該 vendor
        if policy.vendor_id != vendor_id:
            return jsonify({"message": "您沒有權限修改此折價券", "success": False}), 403

        # 獲取更新的欄位
        code = data.get("code")
        type_val = data.get("type")
        value = data.get("value")
        membership_limit = data.get("membership_limit")
        min_purchase = data.get("min_purchase")
        max_discount = data.get("max_discount")

        # 驗證必填欄位
        if type_val is None or value is None or membership_limit is None:
            return (
                jsonify(
                    {
                        "message": "type, value, membership_limit 不可為空或 None",
                        "success": False,
                    }
                ),
                400,
            )

        # 驗證數據類型
        try:
            value = int(value)
            membership_limit = int(membership_limit)
        except (ValueError, TypeError):
            return (
                jsonify(
                    {
                        "message": "invalid value type for: 'value', 'membership_limit'",
                        "success": False,
                    }
                ),
                400,
            )

        # 驗證 type
        if type_val != "percent" and type_val != "fixed":
            return (
                jsonify({"message": "invalid value type for: 'type'", "success": False}),
                400,
            )

        # 驗證 value
        if type_val == "percent":
            if value < 0:
                return (
                    jsonify(
                        {
                            "message": "percent value must be greater than or equal to 0",
                            "success": False,
                        }
                    ),
                    400,
                )
            if value >= 100:
                return (
                    jsonify(
                        {"message": "percent value must be less than 100", "success": False}
                    ),
                    400,
                )

        if type_val == "fixed":
            if min_purchase is None:
                return (
                    jsonify(
                        {
                            "message": "min_purchase is required for fixed type",
                            "success": False,
                        }
                    ),
                    400,
                )
            try:
                min_purchase = int(min_purchase)
            except (ValueError, TypeError):
                return (
                    jsonify(
                        {
                            "message": "invalid value type for: 'min_purchase'",
                            "success": False,
                        }
                    ),
                    400,
                )

            if value < 0:
                return (
                    jsonify(
                        {
                            "message": "fixed value must be greater than or equal to 0",
                            "success": False,
                        }
                    ),
                    400,
                )
            if min_purchase < 0:
                return (
                    jsonify(
                        {
                            "message": "min_purchase must be greater than or equal to 0",
                            "success": False,
                        }
                    ),
                    400,
                )
            if min_purchase <= value:
                return (
                    jsonify(
                        {
                            "message": "min_purchase must be greater than fixed value",
                            "success": False,
                        }
                    ),
                    400,
                )

        # 驗證 code 長度
        if code:
            if len(code) > 20:
                return jsonify({"message": "折價碼長度不能超過 20 個字元", "success": False}), 400
            if len(code) < 3:
                return jsonify({"message": "折價碼長度至少需要 3 個字元", "success": False}), 400

            # 檢查 code 是否與其他折價券重複（排除自己）
            if code != policy.code:
                existing_code = Discount_Policy.query.filter_by(
                    vendor_id=vendor_id, code=code
                ).first()
                if existing_code:
                    return jsonify({"message": "折價碼已存在，請使用其他代碼", "success": False}), 400

        # 解析日期
        start_date_str = data.get("start_date")
        parsed_start_date = None

        if start_date_str:
            try:
                parsed_start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"message": "開始日期格式錯誤", "success": False}), 400

        expiry_date_str = data.get("expiry_date")
        parsed_expiry_date = None

        if expiry_date_str:
            try:
                parsed_expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"message": "結束日期格式錯誤", "success": False}), 400

        # 驗證日期範圍
        if parsed_start_date and parsed_expiry_date:
            if parsed_expiry_date < parsed_start_date:
                return jsonify({"message": "結束日期不能早於開始日期", "success": False}), 400

        # 更新折價券
        if code is not None:
            policy.code = code
        policy.type = type_val
        policy.value = value
        policy.membership_limit = membership_limit

        if min_purchase is not None:
            policy.min_purchase = min_purchase
        else:
            policy.min_purchase = 0

        if max_discount is not None:
            policy.max_discount = max_discount
        else:
            policy.max_discount = None

        if parsed_start_date is not None:
            policy.start_date = parsed_start_date

        if parsed_expiry_date is not None:
            policy.expiry_date = parsed_expiry_date

        db.session.commit()

        return (
            jsonify(
                {
                    "policy_id": policy.id,
                    "message": "更新折價券成功",
                    "success": True,
                }
            ),
            200,
        )

    except ValueError as e:
        db.session.rollback()
        return jsonify({"message": f"資料驗證錯誤：{str(e)}", "success": False}), 400
    except Exception as e:
        db.session.rollback()
        # 檢查是否是數據庫約束錯誤
        error_msg = str(e).lower()
        if "duplicate" in error_msg or "unique" in error_msg:
            return jsonify({"message": "折價碼已存在，請使用其他代碼", "success": False}), 400
        elif "data too long" in error_msg:
            return jsonify({"message": "輸入的資料過長，請檢查所有欄位", "success": False}), 400
        elif "foreign key" in error_msg:
            return jsonify({"message": "商家 ID 無效", "success": False}), 400
        else:
            # 記錄詳細錯誤到伺服器日誌
            return jsonify({"message": "更新折價券失敗，請稍後再試", "success": False}), 500



from sqlalchemy import func

def get_public_vendors():
    try:
        vendors = (
            db.session.query(
                Vendor,
                func.coalesce(func.avg(Review.rating), 0).label("avg_rating"),
                func.count(Review.id).label("review_count")
            )
            .outerjoin(Review, Vendor.id == Review.vendor_id)
            .filter(Vendor.is_active == True, Vendor.is_verified == True)
            .group_by(Vendor.id)
            .all()
        )

        result = []
        for v, avg_rating, review_count in vendors:
            result.append(
                {
                    "id": v.id,
                    "name": v.name,
                    "address": v.address,
                    "phone_number": v.phone_number,
                    "email": v.email,
                    "description": v.description,
                    "logo_url": v.logo_url,
                    "avg_rating": round(avg_rating, 2),
                    "review_count": review_count
                }
            )

        return jsonify({
            "success": True,
            "message": "Retrieved public vendor list successfully",
            "data": result,
        }), 200

    except Exception as e:
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500




def get_vendor_sales(vendor_id: int):
    """Compute sales summary for a vendor with requested granularity.

    Query param: granularity in ['daily','weekly','monthly','yearly'] (default 'weekly')
    Returns JSON with:
      - 'series': list of { label, gross_revenue, discount, net_revenue, orders }
      - 'top_drinks': list of { product_id, product_name, quantity, revenue }
      - 'summary': totals
    """
    try:
        gran = (request.args.get('granularity') or 'weekly').lower()
        if gran not in ('daily', 'weekly', 'monthly', 'yearly'):
            gran = 'weekly'

        COST_RATIO = 0.6

        orders = (
            Order.query
            .filter_by(vendor_id=vendor_id)
            .filter(Order.is_completed == True)
            .all()
        )

        total_gross = 0
        total_discount = 0
        total_orders = 0

        buckets = {}
        product_sales = {}

        for o in orders:
            if o.refund_status == 'refunded':
                continue

            total_orders += 1
            gross = 0
            for it in getattr(o, 'items', []):
                qty = getattr(it, 'quantity', 0) or 0
                price = getattr(it, 'price', 0) or 0
                gross += price * qty

                pid = getattr(it, 'product_id', None)
                pname = None
                if getattr(it, 'product', None):
                    pname = getattr(it.product, 'name', None)
                if pid is not None:
                    ps = product_sales.get(pid)
                    if not ps:
                        ps = {'product_id': pid, 'product_name': pname or 'Unknown', 'quantity': 0, 'revenue': 0}
                        product_sales[pid] = ps
                    ps['quantity'] += qty
                    ps['revenue'] += price * qty

            total_gross += gross
            total_discount += (o.discount_amount or 0)

            dt = o.created_at
            if not dt:
                # fallback bucket
                key = ('1970', 0)
            else:
                if gran == 'daily':
                    key = (dt.year, dt.month, dt.day)
                elif gran == 'weekly':
                    y, w, _ = dt.isocalendar()
                    key = (y, w)
                elif gran == 'monthly':
                    key = (dt.year, dt.month)
                else:  # yearly
                    key = (dt.year,)

            entry = buckets.get(key)
            if not entry:
                entry = {'gross_revenue': 0, 'discount': 0, 'orders': 0}
                buckets[key] = entry

            entry['gross_revenue'] += gross
            entry['discount'] += (o.discount_amount or 0)
            entry['orders'] += 1

        # build series sorted by key
        series = []
        def key_sort(k):
            return k

        for k, v in sorted(buckets.items(), key=lambda kv: key_sort(kv[0])):
            # create human friendly label
            if gran == 'daily':
                year, month, day = k
                label = f"{year:04d}-{month:02d}-{day:02d}"
            elif gran == 'weekly':
                year, week = k
                label = f"{year}-W{week}"
            elif gran == 'monthly':
                year, month = k
                label = f"{year:04d}-{month:02d}"
            else:
                (year,) = k
                label = f"{year}"

            revenue = v.get('gross_revenue', 0)
            discount = v.get('discount', 0)
            net = revenue - discount
            series.append({'label': label, 'gross_revenue': revenue, 'discount': discount, 'net_revenue': net, 'orders': v.get('orders', 0)})

        top_drinks = sorted(product_sales.values(), key=lambda x: x['quantity'], reverse=True)[:10]

        summary = {
            'total_gross_revenue': total_gross,
            'total_discount': total_discount,
            'total_net_revenue': total_gross - total_discount,
            'estimated_cost': int(round(total_gross * COST_RATIO)),
            'estimated_profit': int(round((total_gross - total_discount) - (total_gross * COST_RATIO))),
            'orders_count': total_orders,
        }

        return (
            jsonify({
                'success': True,
                'message': 'vendor sales summary',
                'summary': summary,
                'series': series,
                'top_drinks': top_drinks,
                'granularity': gran,
            }),
            200,
        )

    except Exception as e:
        return jsonify({'message': 'system error', 'error': str(e), 'success': False}), 500

@require_login(role=["vendor"])
def update_vendor_description():
    """
    修改 Vendor 的 description
    Payload 範例: { "description": "我們是一家專賣有機食品的商店..." }
    """

    # 1. 權限檢查 (Security Check)
    # 必須確保登入者存在，且角色是 'vendor'
    current_user_id = session.get('user_id')
    current_role = session.get('role')

    if not current_user_id or current_role != 'vendor':
        return jsonify({
            "success": False, 
            "message": "Unauthorized: Only vendors can perform this action"
        }), 403

    # 2. 獲取並驗證資料
    data = request.get_json()
    
    # 檢查請求中是否有 description 欄位
    if 'description' not in data:
        return jsonify({
            "success": False, 
            "message": "Missing 'description' field"
        }), 400

    new_description = data.get('description')

    # 3. 查詢 Vendor 資料
    # 因為 Vendor 繼承 User，且 PK 是 user_id，所以直接用 get(current_user_id) 即可
    vendor = Vendor.query.get(current_user_id)

    if not vendor:
        return jsonify({
            "success": False, 
            "message": "Vendor profile not found"
        }), 404

    # 4. 更新並儲存 (Update & Commit)
    try:
        # 直接賦值，SQLAlchemy 會自動追蹤變更 (Dirty checking)
        vendor.description = new_description
        
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Description updated successfully",
            "data": [{
                "id": vendor.user_id,
                "description": vendor.description
            }]
        }), 200

    except Exception as e:
        db.session.rollback() # 發生錯誤時回滾，避免 DB 鎖死
        return jsonify({
            "success": False, 
            "message": "Database error occurred"
        }), 500

@require_login(role=["vendor"]) 
def update_vendor_manager_info():
    """
    更新 Vendor 的 Manager (負責人/經理) 資料
    邏輯：
    1. 採用 "Find or Create" 模式決定新經理。
    2. [新增] 如果更換了經理，檢查 "舊經理" 是否還有其他店家在用。若無，則刪除舊經理資料。
    """
    current_user_id = session.get('user_id')
    data = request.get_json()
    
    mgr_name = data.get('name')
    mgr_email = data.get('email')
    mgr_phone = data.get('phone_number')

    if not all([mgr_name, mgr_email, mgr_phone]):
        return jsonify({
            "success": False, 
            "message": "Missing manager info. Name, Email, and Phone number are required."
        }), 400

    try:
        # 1. 查詢 Vendor 本體
        vendor = Vendor.query.get(current_user_id)
        if not vendor:
            return jsonify({"success": False, "message": "Vendor not found"}), 404

        # [關鍵步驟 A] 在修改前，先記住 "舊經理" 是誰
        old_manager_id = vendor.vendor_manager_id

        # 2. [核心邏輯] Find or Create 新經理
        existing_manager = Vendor_Manager.query.filter(
            or_(
                Vendor_Manager.email == mgr_email,
                Vendor_Manager.phone_number == mgr_phone
            )
        ).first()

        target_manager_id = None
        
        if existing_manager:
            # 找到了：使用現有的 Manager ID
            # 順便更新姓名 (假設使用者想修正名字)
            existing_manager.name = mgr_name
            target_manager_id = existing_manager.id
        else:
            # 沒找到：建立新的 Manager
            new_mgr = Vendor_Manager(
                name=mgr_name,
                email=mgr_email,
                phone_number=mgr_phone
            )
            db.session.add(new_mgr)
            db.session.flush() 
            target_manager_id = new_mgr.id

        # 3. 更新 Vendor 的關聯
        vendor.vendor_manager_id = target_manager_id
        
        # [關鍵步驟 B] 檢查舊經理是否變成 "孤兒" (Orphan) 並刪除
        # 只有在 "確實換了人" (ID 不同) 的情況下才需要檢查
        if old_manager_id and old_manager_id != target_manager_id:
            
            # 查詢還有多少個 Vendor 指向這個舊經理
            # 注意：因為上面第 3 步已經把我們自己 (current vendor) 移除了，
            # 所以如果 count 為 0，代表真的沒人用了。
            remaining_usage = Vendor.query.filter_by(vendor_manager_id=old_manager_id).count()
            
            if remaining_usage == 0:
                old_manager_to_delete = Vendor_Manager.query.get(old_manager_id)
                if old_manager_to_delete:
                    db.session.delete(old_manager_to_delete)

        db.session.commit()

        # 4. 準備回傳資料
        final_manager = Vendor_Manager.query.get(target_manager_id)

        return jsonify({
            "success": True,
            "message": "Manager information updated successfully",
            "data": {
                "manager": {
                    "id": final_manager.id,
                    "name": final_manager.name,
                    "email": final_manager.email,
                    "phone_number": final_manager.phone_number
                }
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False, 
            "message": f"Database error: {str(e)}"
        }), 500

def get_info(vendor_id : int):
    """Get vendor information by ID"""
    
    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({
            "success": False, 
            "message": "Vendor profile not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Vendor information retrieved successfully",
        "data": {
            "revenue": vendor.revenue,
            "address": vendor.address,
            "vendor_manager_id": vendor.vendor_manager_id,
            "logo_url": vendor.logo_url,
            "description": vendor.description,
            "is_active": vendor.is_active,
            "name": vendor.name
        }
    }), 200

@require_login(role=["vendor"])
def update_vendor_logo():
    """
    更新 Vendor 的 Logo URL
    前端應先使用 Cloudinary 上傳圖片取得 URL，再傳送到此 API

    Payload:
    {
        "logo_url": "https://res.cloudinary.com/..."
    }

    Return:
    {
        "success": true,
        "message": "Logo updated successfully",
        "data": {
            "logo_url": "https://res.cloudinary.com/..."
        }
    }
    """
    data = request.get_json()

    if not data or 'logo_url' not in data:
        return jsonify({
            "message": "logo_url is required in request body.",
            "success": False
        }), 400

    logo_url = data.get('logo_url')

    # 基本驗證：確保是有效的 URL
    if not logo_url or not isinstance(logo_url, str):
        return jsonify({
            "message": "Invalid logo_url format.",
            "success": False
        }), 400

    vendor_id = session["user_id"]
    vendor = Vendor.query.get(vendor_id)

    if not vendor:
        return jsonify({
            "message": "Vendor not found.",
            "success": False
        }), 404

    try:
        vendor.logo_url = logo_url
        db.session.commit()

        return jsonify({
            "message": "Logo updated successfully.",
            "success": True,
            "data": {
                "logo_url": vendor.logo_url
            },
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500
