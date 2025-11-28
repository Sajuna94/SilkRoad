from flask import jsonify, request
from models import Vendor, Product, Discount_Policy
from config.database import db
from utils import require_login


from datetime import datetime, date

def validate_expiry_date(date_string):
    if not date_string:
        return None 

    EXPECTED_FORMAT = '%Y-%m-%d'

    try:
        dt_object = datetime.strptime(date_string, EXPECTED_FORMAT)
        return dt_object.date() 
        
    except ValueError:
        raise ValueError(
            f"日期格式錯誤。"
        )

@require_login    
def add_product():
    data = request.get_json()
    
    if not data:
        return jsonify({
            "message": "data connot be empty",
            "success": False
        }), 400
        
    if not isinstance(data, dict):
        return jsonify({
            "message": "Expected a dictionary",
            "success": False
        }), 400
        
    require_col = ["vendor_id", "name", "price", "description", "image_url"]
    for col in require_col:
        if col not in data:
            return jsonify({
                "message": f"Missing required column: {col}",
                "success": False
            }), 400
            
    vendor_id = data.get("vendor_id")
    name = data.get("name")
    price = data.get("price")
    description = data.get("description")
    is_listed = data.get("is_listed")
    image_url = data.get("image_url")
    
    if is_listed is None:
        is_listed = True    #set default
        
    vndr = Vendor.query.get(vendor_id)
    if not vndr:
        return jsonify({
            "message": f"Vendor with id {vendor_id} not found",
            "success": False
        }), 404
        
    try:
        if isinstance(price, str):
            price = int(price)
        elif isinstance(price, int):
            pass
        else:
            raise ValueError("Invalid price type")
            
        if isinstance(is_listed, str):
            is_listed = is_listed.lower() == "true"
        else:
            is_listed = bool(is_listed)
    except (ValueError, TypeError) as e:
        return jsonify({
            "message": f"Invalid data type: {str(e)}",
            "success": False
        }), 400
    
    new_prdct = Product(
        vendor_id=vendor_id,
        name=name,
        price=price,
        description=description,
        is_listed=is_listed,
        image_url=image_url
    )
    
    try:
        db.session.add(new_prdct)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Failed to add product: {str(e)}",
            "success": False
        }), 500
    
    return jsonify({
        "message": "Product added successfully",
        "success": True,
        "product_id": new_prdct.id
    }), 201

@require_login
def update_products():
    data = request.get_json()
    
    if not data:
        return jsonify({
            "message": "data connot be empty",
            "success": False
        }), 400
        
    if not isinstance(data, list):
        return jsonify({
            "message": "Expected a list",
            "success": False
        }), 400
    
    #可變得field
    MUT = ["name", "price", "description", "is_listed", "image_url"]
    updated_products = []
    
    for update in data:
        
        product_id = update.get("product_id")
        col_name = update.get("behavior", {}).get("col_name")
        value = update.get("behavior", {}).get("value")
        
        if not all([product_id, col_name, value is not None]) or col_name not in MUT:
            return jsonify({
                "message": "Product update failed: Invalid data or column is immutable",
                "success": False
            }), 400
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({
                "message": f"Product with id {product_id} not found",
                "success": False
            }), 404
            
        #change value type
        try:
            match col_name:
                case "price":
                    value = int(value)
                case "is_listed":
                    value = value.lower() == "true" if isinstance(value, str) else bool(value)
        except (ValueError, AttributeError):
            return jsonify({
                "message": f"Product update failed: Invalid value for {col_name}",
                "success": False
            }), 400
        
        setattr(product, col_name, value)
        updated_products.append(product)
        
    try:        
        db.session.commit()
        
        # 準備回傳的產品資訊
        products_data = []
        for product in updated_products:
            products_data.append({
                "id": product.id,
                "vendor_id": product.vendor_id,
                "name": product.name,
                "price": product.price,
                "description": product.description,
                "image_url": product.image_url,
                "is_listed": product.is_listed,
                "created_at": product.created_at.isoformat() if product.created_at else None
            })
        
        return jsonify({
            "message": "Product updated successfully",
            "success": True,
            "products": products_data
        }), 200
    except Exception as e:
            db.session.rollback()
            return jsonify({
                "message": f"Product update failed: {str(e)}",
                "success": False
            }), 500

def get_vendor_products(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({
                "message": "Vendor not found",
                "success": False
            }), 404
        
        products = Product.query.filter_by(vendor_id=vendor_id).all()
        
        # 準備回傳的產品資訊
        products_data = []
        for product in products:
            products_data.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "description": product.description,
                "image_url": product.image_url,
                "is_listed": product.is_listed,
            })
        
        return jsonify({
            "message": "Vendor products retrieved successfully",
            "success": True,
            "products": products_data
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Failed to retrieve vendor products: {str(e)}",
            "success": False
        }), 500

def add_discount_policy():
    data = request.get_json()

    '''
    預計傳給我{
    "vendor_id":XXX,
    "type":XXX,
    "value":XXX,
    "min_purchase":XXX,
    "max_discount":XXX,
    "membership_limit":XXX,
    "expiry_date":XXX,
    }
    '''

    if not data:
        return jsonify({'message': '無效的請求數據', "success": False}), 400
    
    vendor_id = data.get("vendor_id")
    
    if not vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400
    try:
        vendor_exists = db.session.query(Vendor).get(vendor_id)
        if vendor_exists is None:
            return jsonify({"message": "無效的 vendor_id", 
                            "success": False}), 400
    except Exception:
        return jsonify({"message": "系統錯誤，無法驗證 vender_id", 
                        "success": False}), 500


    type_val = data.get("type")
    value = data.get("value")
    membership_limit = data.get("membership_limit") 
    min_purchase = data.get("min_purchase")         
    max_discount = data.get("max_discount")       
    
    if type_val is None or value is None or membership_limit is None:
        return jsonify({"message": "type, value, membership_limit 不可為空或 None", 
                        "success": False}), 400


    expiry_date_str = data.get("expiry_date") 
    parsed_expiry_date = None
    
    if expiry_date_str:
        try:
            parsed_expiry_date = datetime.strptime(expiry_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"message": "日期格式錯誤", 
                            "success": False}), 400


    try:
        add_discount_policy = Discount_Policy(
            vendor_id = vendor_id,
            type = type_val,
            value = value,
            membership_limit = membership_limit, 
            expiry_date = parsed_expiry_date    
        )
        
        if min_purchase is not None and min_purchase != 0:
            add_discount_policy.min_purchase = min_purchase

        if max_discount is not None:
            add_discount_policy.max_discount = max_discount
        

        db.session.add(add_discount_policy)
        db.session.commit()
        
        return jsonify({"message": "新增折價券成功",
                        # "policy_id": add_discount_policy.id,
                         "success": True}), 201 

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"資料庫錯誤: {str(e)}",
                        "success": False}), 500


    

