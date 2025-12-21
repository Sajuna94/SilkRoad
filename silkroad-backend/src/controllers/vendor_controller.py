from flask import jsonify, request
from models import Ice_Option, Sizes_Option, Sugar_Option, Vendor, Product, Discount_Policy
from config.database import db
from utils import require_login

from datetime import datetime


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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
def add_product():
    data = request.get_json()

    vendor_id = data.get("vendor_id")
    name = data.get("name")
    price = data.get("price")
    description = data.get("description")
    is_listed = data.get("is_listed")
    img_url = data.get("img_url")

    sgr_options = data.get("sugar_options")
    ice_options = data.get("ice_options")
    size_options = data.get("size_options")

    if not vendor_id or not name or not price or description is None:
        return jsonify(
            {"message": "Missing required fields", "success": False}
        ), 400

    if not sgr_options or not ice_options or not size_options:
        return jsonify(
            {"message": "Missing required fields: options", "success": False}
        ), 400
        
    if not isinstance(sgr_options, str) or not isinstance(ice_options, str) or not isinstance(size_options, str):
        return jsonify(
            {"message": "options must be strings", "success": False}
        ), 400

    try:
        vendor_id = int(vendor_id)
    except (ValueError, TypeError):
        return jsonify(
            {"message": "Invalid vendor_id", "success": False}
        ), 400

    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify(
            {"message": f"Vendor with id {vendor_id} not found", "success": False}
        ), 404

    try:
        # 轉換 price
        if isinstance(price, str):
            price = int(price)
        elif isinstance(price, int):
            pass
        else:
            raise ValueError("Invalid price type")

        # 轉換 is_listed
        if is_listed is None:
            is_listed = True  # 預設值
        elif isinstance(is_listed, str):
            is_listed = is_listed.lower() == "true"
        else:
            is_listed = bool(is_listed)

    except (ValueError, TypeError) as e:
        return jsonify(
            {"message": f"Invalid data type: {str(e)}", "success": False}
        ), 400

    # ===== 創建產品 =====
    new_product = Product(
        vendor_id=vendor_id,
        name=name,
        price=price,
        description=description,
        is_listed=is_listed,
        image_url=img_url,
    )

    try:
        db.session.add(new_product)
        db.session.commit()

        options_to_add = []        
        options_to_add.append(Sugar_Option(product_id=new_product.id, options=sgr_options))
        options_to_add.append(Ice_Option(product_id=new_product.id, options=ice_options))
        options_to_add.append(Sizes_Option(product_id=new_product.id, options=size_options))

        db.session.add_all(options_to_add)
        db.session.commit()

        return jsonify(
            {
                "message": "Product added successfully",
                "success": True,
                "product": {
                    "id": new_product.id,
                    "name": new_product.name,
                    "price": new_product.price,
                },
            }
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify(
            {"message": f"Failed to add product: {str(e)}", "success": False}
        ), 500


@require_login(role=["vendor"])
def update_products():
    data = request.get_json()

    if not data:
        return jsonify(
            {
                "message": "data connot be empty", 
                "success": False,
                "Changed": []
            }
        ), 400

    if not isinstance(data, list):
        return jsonify(
            {
                "message": "Expected a list", 
                "success": False,
                "Changed": []
            }
        ), 400

    # 可變得field
    MUT = {"name", "price", "description", "is_listed", "image_url", 
        "sugar_options", "ice_options", "size_options"}
    updated_products = []

    for update in data:
        product_id = update.get("product_id")
        col_name = update.get("behavior", {}).get("col_name")
        value = update.get("behavior", {}).get("value")

        if not all([product_id, col_name, value is not None]):
            return jsonify(
                {
                    "message": "Missing required fields", 
                    "success": False,
                    "Changed": [pd.id for pd in updated_products]
                }
            ), 400
            
        if not isinstance(col_name, str) or not isinstance(value, str):
            return jsonify(
                {
                    "message": "col_name and value must be a string", 
                    "success": False,
                    "Changed": [pd.id for pd in updated_products]
                }
            ), 400
            
        if col_name not in MUT:
            return jsonify(
                {
                    "message": f"Column '{col_name}' is immutable", 
                    "success": False,
                    "Changed": [pd.id for pd in updated_products]
                }
            ), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify(
                {
                    "message": f"Product with id {product_id} not found", 
                    "success": False,
                    "Changed": [pd.id for pd in updated_products]
                }
            ), 404

        # modify
        try:
            if col_name == "price":
                value = int(value)
                setattr(product, col_name, value)
            elif col_name == "is_listed":
                value = value.lower() == "true"
                setattr(product, col_name, value)
            elif "options" in col_name:
                # 處理 options 更新
                value_list = [opt.strip() for opt in value.split(",") if opt.strip()]
                
                # 映射到對應的 option object
                option_map = {
                    "sugar_options": product.sugar_option,
                    "ice_options": product.ice_option,
                    "size_options": product.sizes_option,
                }
                
                option_obj = option_map.get(col_name)
                if option_obj is None:
                    return jsonify({
                        "message": f"Product {product_id} has no {col_name}",
                        "success": False,
                        "Changed": [pd.id for pd in updated_products]
                    }), 400
                
                option_obj.set_options_list(value_list)
            else:
                setattr(product, col_name, value)
                        
        except (ValueError, AttributeError):
            db.session.rollback()
            return jsonify(
                {
                    "message": f"Invalid value for {col_name}", 
                    "success": False,
                    "Changed": [pd.id for pd in updated_products]
                }
            ), 400
        updated_products.append(product)

    try:
        db.session.commit()

        # return info
        products_data = []
        for product in updated_products:
            products_data.append(
                {
                    "id": product.id,
                    "vendor_id": product.vendor_id,
                    "name": product.name,
                    "price": product.price,
                    "description": product.description,
                    "image_url": product.image_url,
                    "is_listed": product.is_listed,
                    "created_at": product.created_at.isoformat() if product.created_at else None,
                    "sugar_options": product.sugar_option.get_options_list() if product.sugar_option else None,
                    "ice_options": product.ice_option.get_options_list() if product.ice_option else None,
                    "size_options": product.sizes_option.get_options_list() if product.sizes_option else None
                }
            )

        return jsonify(
            {
                "message": "Product updated successfully",
                "success": True,
                "products": products_data,
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(
            {
                "message": f"database error: {str(e)}", 
                "success": False,
                "Changed": [pd.id for pd in updated_products]
            }
        ), 500


def view_vendor_products(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({"message": "Vendor not found", "success": False}), 404

        products = Product.query.filter_by(vendor_id=vendor_id).all()
        if not products:
            return jsonify(
                {
                    "message": "No products found for this vendor",
                    "success": True,
                    "products": [],
                }
            ), 200

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

        return jsonify(
            {
                "message": "Vendor products retrieved successfully",
                "success": True,
                "products": products_data,
            }
        ), 200
    except Exception as e:
        return jsonify(
            {
                "message": f"Failed to retrieve vendor products: {str(e)}",
                "success": False,
            }
        ), 500

def view_vendor_product_detail(vendor_id, product_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({"message": "Vendor not found", "success": False}), 404

        product = Product.query.get(product_id)
        if not product:
            return jsonify(
                {
                    "message": "Product not found",
                    "success": True,
                    "products": [],
                }
            ), 404
        return jsonify(
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
                    "size_option": product.sizes_option.get_options_list()
                }
            }
        ), 404

    except Exception as e:
        return jsonify(
            {
                "message": f"Fail with {str(e)}",
                "success": False
            }
        ), 500



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
        return jsonify(
            {"message": "系統錯誤，無法驗證 vendor_id", "success": False}
        ), 500

    type_val = data.get("type")
    value = data.get("value")
    membership_limit = data.get("membership_limit")
    min_purchase = data.get("min_purchase")
    max_discount = data.get("max_discount")

    if type_val is None or value is None or membership_limit is None:
        return jsonify(
            {
                "message": "type, value, membership_limit 不可為空或 None",
                "success": False,
            }
        ), 400

    try:
        value = int(value)
        membership_limit = int(membership_limit)
    except (ValueError, TypeError):
        return jsonify(
            {
                "message": "invalid value type for: 'value', 'membership_limit'",
                "success": False,
            }
        ), 400

    # check enum
    if type_val != "percent" and type_val != "fixed":
        return jsonify(
            {"message": "invalid value type for: 'type'", "success": False}
        ), 400

    # check value
    if type_val == "percent":
        if value < 0:
            return jsonify(
                {
                    "message": "percent value must be greater than or equal to 0",
                    "success": False,
                }
            ), 400
        if value >= 100:
            return jsonify(
                {"message": "percent value must be less than 100", "success": False}
            ), 400

    if type_val == "fixed":
        if min_purchase is None:
            return jsonify(
                {"message": "min_purchase is required for fixed type", "success": False}
            ), 400
        try:
            min_purchase = int(min_purchase)
        except (ValueError, TypeError):
            return jsonify(
                {"message": "invalid value type for: 'min_purchase'", "success": False}
            ), 400

        if value < 0:
            return jsonify(
                {
                    "message": "fixed value must be greater than or equal to 0",
                    "success": False,
                }
            ), 400
        if min_purchase < 0:
            return jsonify(
                {
                    "message": "min_purchase must be greater than or equal to 0",
                    "success": False,
                }
            ), 400
        if min_purchase <= value:
            return jsonify(
                {
                    "message": "min_purchase must be greater than fixed value",
                    "success": False,
                }
            ), 400

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

        return jsonify(
            {
                "policy_id": add_discount_policy.id,
                "message": "新增折價券成功",
                "success": True,
            }
        ), 201
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
        return jsonify(
            {"message": "系統錯誤，無法驗證 vendor_id", "success": False}
        ), 500

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
        return jsonify(
            {"message": "缺少 policy_id 或 vendor_id", "success": False}
        ), 400

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
        return jsonify(
            {"message": "系統錯誤，停用失敗", "error": str(e), "success": False}
        ), 500
    
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
            result.append({
                "id": v.id,
                "name": v.name,          # 店名
                "address": v.address,    # 地址
                "phone_number": v.phone_number,
                "email": v.email,        # 聯絡信箱 (視需求決定是否公開)
                # "created_at": v.created_at.isoformat() # 如果前端需要顯示 "新店家" 標籤可加這行
            })

        return jsonify({
            "success": True,
            "message": "Retrieved public vendor list successfully",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500
