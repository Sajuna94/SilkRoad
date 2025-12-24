from flask import jsonify, request, session
from models import (
    Ice_Option,
    Sizes_Option,
    Sugar_Option,
    Vendor,
    Product,
    Discount_Policy,
)
from config.database import db
from utils import require_login

from datetime import datetime


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
    products = Product.query.filter_by(vendor_id=vendor_id).all()
    data = []

    for p in products:
        # 取得 options，假設每個 options table 的 options 欄位是以逗號分隔的字串
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

    return jsonify({"success": True, "data": data})

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
                option_obj = getattr(product, col_name.replace("_options", "_option"), None)
                if not option_obj:
                    return jsonify({
                        "message": f"Product {product_id} has no {col_name}",
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
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({"message": "Vendor not found", "success": False}), 404

        products = Product.query.filter_by(vendor_id=vendor_id).all()
        if not products:
            return (
                jsonify(
                    {
                        "message": "No products found for this vendor",
                        "success": True,
                        "products": [],
                    }
                ),
                200,
            )

        # 準備回傳的產品資訊
        products_data = []
        for product in products:
            products_data.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url,
                    "is_listed": product.is_listed,
                }
            )

        return (
            jsonify(
                {
                    "message": "Vendor products retrieved successfully",
                    "success": True,
                    "products": products_data,
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify(
                {
                    "message": f"Failed to retrieve vendor products: {str(e)}",
                    "success": False,
                }
            ),
            500,
        )


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
    "type":XXX,
    "value":XXX,
    "min_purchase":XXX,
    "max_discount":XXX,
    "membership_limit":XXX,
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

    expiry_date_str = data.get("expiry_date")
    parsed_expiry_date = None

    if expiry_date_str:
        try:
            parsed_expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "日期格式錯誤", "success": False}), 400

    try:
        add_discount_policy = Discount_Policy(
            vendor_id=vendor_id,
            type=type_val,
            is_available=True,
            value=value,
            membership_limit=membership_limit,
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
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"資料庫錯誤: {str(e)}", "success": False}), 500


@require_login(role=["vendor", "customer"])
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
            formatted_date = (
                policy.expiry_date.isoformat() if policy.expiry_date else None
            )

            result_list.append(
                {
                    "policy_id": policy.id,
                    "vendor_id": target_vendor_id,
                    "is_available": policy.is_available,
                    "type": str(policy.type),
                    "value": policy.value,
                    "min_purchase": policy.min_purchase,
                    "max_discount": policy.max_discount,
                    "membership_limit": policy.membership_limit,
                    "expiry_date": formatted_date,
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
