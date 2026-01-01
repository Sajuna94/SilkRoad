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
    Order
)
from config.database import db
from utils import require_login

from datetime import datetime, date
from sqlalchemy import or_, and_
from sqlalchemy.orm import joinedload


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
        sizes = [s.strip() for s in (p.sizes_option.options.split(",") if p.sizes_option else []) if s.strip()]
        sugars = [s.strip() for s in (p.sugar_option.options.split(",") if p.sugar_option else []) if s.strip()]
        ices = [s.strip() for s in (p.ice_option.options.split(",") if p.ice_option else []) if s.strip()]

        data.append({
            "id": p.id,
            "vendor_id": p.vendor_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "options": {
                "size": sizes,
                "sugar": sugars,
                "ice": ices,
            },
            "image_url": p.image_url,
            "is_listed": p.is_listed,
        })

    return jsonify({"message": "", "success": True, "products": data})

@require_login(role=["vendor"])
def add_product():
    data: dict = request.get_json() or {}
    print(data)

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
                "success": False,
            }), 400
            

    # Validate 'options' subfields if 'options' exists and is a dict
    options: dict = data["options"]
    options_required = ["size", "ice", "sugar"]

    for key in options_required:
        if key not in options:
            return jsonify({
                "message": f"Missing '{key}' in options",
                "success": False
            }), 400

        if not isinstance(options[key], str):
            return jsonify({
                "message": f"'{key}' must be a string of comma-separated values",
                "success": False
            }), 400

    # Convert comma-separated string to list for storage
    for key in options_required:
        options[key] = [opt.strip() for opt in options[key].split(",") if opt.strip()]
    print(options)

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

    print(new_product)

    try:
        db.session.add(new_product)
        db.session.flush()

        db.session.add_all([
            Sugar_Option(product_id=new_product.id, options=",".join(options["sugar"])),
            Ice_Option(product_id=new_product.id, options=",".join(options["ice"])),
            Sizes_Option(product_id=new_product.id, options=",".join(options["size"])),
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
        "sugar_options", "ice_options", "size_options"
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

                # 特別處理 size_options -> sizes_option (注意複數)
                if col_name == "size_options":
                    option_attr_name = "sizes_option"
                else:
                    option_attr_name = col_name.replace("_options", "_option")

                option_obj = getattr(product, option_attr_name, None)
                if not option_obj:
                    return jsonify({
                        "message": f"Product {product_id} has no {option_attr_name}",
                        "success": False
                    }), 400
                option_obj.set_options_list(value_list)
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


def view_vendor_products(vendor_id):
    # vendor = Vendor.query.get(vendor_id)
    # if not vendor:
        # return jsonify({"message": "Vendor not found", "success": False}), 404

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
        sizes = [s.strip() for s in (p.sizes_option.options.split(",") if p.sizes_option else []) if s.strip()]
        sugars = [s.strip() for s in (p.sugar_option.options.split(",") if p.sugar_option else []) if s.strip()]
        ices = [s.strip() for s in (p.ice_option.options.split(",") if p.ice_option else []) if s.strip()]

        data.append({
            "id": p.id,
            "vendor_id": p.vendor_id,
            "name": p.name,
            "price": p.price,
            "description": p.description,
            "options": {
                "size": sizes,
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


def view_vendor_product_detail(vendor_id, product_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({"message": "Vendor not found", "success": False}), 404

        product = Product.query.get(product_id)
        if not product:
            return (
                jsonify(
                    {
                        "message": "Product not found",
                        "success": True,
                        "products": [],
                    }
                ),
                404,
            )
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
                        "size_option": product.sizes_option.get_options_list(),
                    },
                }
            ),
            200,
        )

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
            print(f"Discount policy creation error: {str(e)}")
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
        print(f"Error details: {e}")
        return jsonify({"message": "系統錯誤", "error": str(e)}), 500

@require_login(role=["customer"])
def view_customer_discounts():
    # 取得當前登入用戶 ID (對應 orders 表的 user_id)
    current_user_id = session.get("user_id")
    
    data = request.get_json()
    # 如果有傳 vendor_id，就只看該店家的券；若無，則看全平台
    target_vendor_id = data.get("vendor_id")
    
    today = date.today()

    try:
        # 1. 從 orders 表找出該用戶「使用過」的 policy_id 列表
        used_policies_query = db.session.query(Order.policy_id).filter(
            Order.user_id == current_user_id,
            Order.policy_id.isnot(None)
        ).distinct().all()
        
        # 轉換為簡單的 ID 列表: [1, 5, 12...]
        used_ids = [row[0] for row in used_policies_query]

        # 2. 構建查詢條件
        # 條件 A: 該券目前處於「發布中」且「有效期限內」
        is_active = and_(
            Discount_Policy.is_available == True,
            Discount_Policy.start_date <= today,
            or_(
                Discount_Policy.expiry_date.is_(None),
                Discount_Policy.expiry_date >= today
            )
        )

        # 條件 B: 該券在用戶的使用歷史名單中
        was_used = Discount_Policy.id.in_(used_ids)

        # 3. 執行查詢 (合併 A 或 B)
        query = Discount_Policy.query.filter(or_(is_active, was_used))

        # 若前端有指定商家，加入篩選
        if target_vendor_id:
            query = query.filter(Discount_Policy.vendor_id == target_vendor_id)

        policies = query.all()

        # 4. 格式化回傳內容
        result = []
        for p in policies:
            # 決定狀態標籤，方便前端 UI 渲染 (例如已使用的顯示灰色)
            status = "used" if p.id in used_ids else "available"
            
            result.append({
                "policy_id": p.id,
                "vendor_id": p.vendor_id,
                "code": p.code,
                "type": p.type,
                "value": p.value,
                "min_purchase": p.min_purchase,
                "max_discount": p.max_discount,
                "expiry_date": str(p.expiry_date) if p.expiry_date else "永久有效",
                "status": status  # 'used' 或 'available'
            })

        return jsonify({
            "success": True,
            "data": result,
            "count": len(result)
        }), 200

    except Exception as e:
        print(f"Error fetching customer discounts: {e}")
        return jsonify({"message": "系統錯誤", "success": False}), 500
    
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
        print(f"Error details: {e}")
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
            print(f"Discount policy update error: {str(e)}")
            return jsonify({"message": "更新折價券失敗，請稍後再試", "success": False}), 500


def get_public_vendors():
    """
    公開取得所有營業中的店家列表
    權限：公開 (Public) - 訪客、顧客、店家、管理員皆可存取
    """
    try:
        # 這裡我們通常只撈取 is_active=True 的店家
        # 如果你想連停權的都顯示，就把 filter_by 去掉，改用 Vendor.query.all()
        vendors = Vendor.query.filter_by(is_active=True).all()

        result = []
        for v in vendors:
            result.append(
                {
                    "id": v.id,
                    "name": v.name,  # 店名
                    "address": v.address,  # 地址
                    "phone_number": v.phone_number,
                    "email": v.email,  # 聯絡信箱 (視需求決定是否公開)
                    "description": v.description
                    # "created_at": v.created_at.isoformat() # 如果前端需要顯示 "新店家" 標籤可加這行
                }
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Retrieved public vendor list successfully",
                    "data": result,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500

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
        print(f"Update Error: {e}")
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
                    print(f"Cleaned up orphaned manager ID: {old_manager_id}")

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
            # "logo_url": vendor.logo_url,
            "description": vendor.description,
            "is_active": vendor.is_active,
            "name": vendor.name
        }
    }), 200

# 設定上傳相關常量
# UPLOAD_FOLDER = 'static/uploads/logos'
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# @require_login(role=["vendor"])
# def update_vendor_logo():
#     """
#     更新 Vendor 的 logo 圖片
#     接收 multipart/form-data 格式的文件上傳
#     """
#     current_user_id = session.get('user_id')
#     current_role = session.get('role')

#     # 權限檢查
#     if not current_user_id or current_role != 'vendor':
#         return jsonify({
#             "success": False, 
#             "message": "Unauthorized: Only vendors can perform this action"
#         }), 403

#     # 檢查是否有文件在請求中
#     if 'logo' not in request.files:
#         return jsonify({
#             "success": False,
#             "message": "No logo file provided"
#         }), 400

#     file = request.files['logo']

#     # 檢查文件名是否為空
#     if file.filename == '':
#         return jsonify({
#             "success": False,
#             "message": "No file selected"
#         }), 400

#     # 檢查文件類型
#     if not allowed_file(file.filename):
#         return jsonify({
#             "success": False,
#             "message": f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
#         }), 400

#     # 檢查文件大小 (5MB 限制)
#     file.seek(0, os.SEEK_END)  # 移動到文件末尾
#     file_size = file.tell()    # 獲取文件大小
#     file.seek(0)               # 重置文件指針
    
#     if file_size > 5 * 1024 * 1024:  # 5MB
#         return jsonify({
#             "success": False,
#             "message": "File size too large. Maximum size is 5MB"
#         }), 400

#     try:
#         # 查詢 Vendor
#         vendor = Vendor.query.get(current_user_id)
#         if not vendor:
#             return jsonify({
#                 "success": False, 
#                 "message": "Vendor not found"
#             }), 404

#         # 確保上傳目錄存在
#         os.makedirs(UPLOAD_FOLDER, exist_ok=True)

#         # 生成唯一的文件名
#         file_extension = file.filename.rsplit('.', 1)[1].lower()
#         unique_filename = f"{current_user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
#         # 安全的文件名
#         safe_filename = secure_filename(unique_filename)
#         file_path = os.path.join(UPLOAD_FOLDER, safe_filename)

#         # 如果vendor已經有logo，刪除舊文件
#         if vendor.logo_url:
#             old_filename = vendor.logo_url.split('/')[-1]  # 從URL中提取文件名
#             old_file_path = os.path.join(UPLOAD_FOLDER, old_filename)
#             try:
#                 if os.path.exists(old_file_path):
#                     os.remove(old_file_path)
#                     print(f"Deleted old logo file: {old_file_path}")
#             except OSError as e:
#                 print(f"Error deleting old logo file: {e}")
#                 # 不阻止新文件的上傳

#         # 保存新文件
#         file.save(file_path)

#         # 生成相對URL路徑
#         logo_url = f"/static/uploads/logos/{safe_filename}"

#         # 更新數據庫
#         vendor.logo_url = logo_url
#         db.session.commit()

#         return jsonify({
#             "success": True,
#             "message": "Logo uploaded successfully",
#             "data": {
#                 "logo_url": logo_url,
#                 "vendor_id": current_user_id
#             }
#         }), 200

#     except Exception as e:
#         db.session.rollback()
        
#         # 如果數據庫操作失敗，嘗試刪除已上傳的文件
#         if 'file_path' in locals() and os.path.exists(file_path):
#             try:
#                 os.remove(file_path)
#                 print(f"Cleaned up uploaded file after database error: {file_path}")
#             except OSError:
#                 pass

#         print(f"Logo upload error: {e}")
#         return jsonify({
#             "success": False, 
#             "message": "Failed to upload logo. Please try again."
#         }), 500
