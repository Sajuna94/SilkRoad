from typing_extensions import Required
from flask import jsonify, request
from models import Vendor, Product, Discount_Policy
from config.database import db
from utils import require_login

from datetime import datetime, date
from werkzeug.utils import secure_filename
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, '..', 'uploads', 'products')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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

@require_login(role = ["vendor"]) 
def add_product():
    vendor_id = request.form.get('vendor_id')
    name = request.form.get('name')
    price = request.form.get('price')
    description = request.form.get('description')
    is_listed = request.form.get('is_listed')
        
    if not vendor_id or not name or not price or description is None or is_listed is None: 
        return jsonify({
            "message": "Missing required fields",
            "success": False
        }), 400
        
    # ===== 檢查是否有圖片 =====
    if 'image' not in request.files:
        return jsonify({
            "message": "No image file provided",
            "success": False
        }), 400
    
    image_file = request.files['image']
    
    if image_file.filename == '' or image_file.filename is None:
        return jsonify({
            "message": "No image selected",
            "success": False
        }), 400
    
    if not allowed_file(image_file.filename):
        return jsonify({
            "message": "Invalid image type. Allowed types: png, jpg, jpeg, gif, webp",
            "success": False
        }), 400
    
    try:
        vendor_id = int(vendor_id)
    except (ValueError, TypeError):
        return jsonify({
            "message": "Invalid vendor_id",
            "success": False
        }), 400
    
    vendor = Vendor.query.get(vendor_id)
    if not vendor:
        return jsonify({
            "message": f"Vendor with id {vendor_id} not found",
            "success": False
        }), 404
    
    # ===== 處理資料類型轉換 =====
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
        return jsonify({
            "message": f"Invalid data type: {str(e)}",
            "success": False
        }), 400
    
    # ===== 儲存圖片 =====
    try:
        filename = secure_filename(image_file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        name_part, ext = os.path.splitext(filename)
        unique_filename = f"product_{vendor_id}_{timestamp}{ext}"
        
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
        image_file.save(filepath)
        
        image_url = f"/uploads/products/{unique_filename}"
        
    except Exception as e:
        return jsonify({
            "message": f"Failed to save image: {str(e)}",
            "success": False
        }), 500
    
    # ===== 創建產品 =====
    new_product = Product(
        vendor_id=vendor_id,
        name=name,
        price=price,
        description=description,
        is_listed=is_listed,
        image_url=image_url
    )
    
    try:
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            "message": "Product added successfully",
            "success": True,
            "product": {
                "id": new_product.id,
                "name": new_product.name,
                "price": new_product.price,
                "image_url": image_url
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        
        # 如果資料庫失敗,刪除已上傳的圖片
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except:
            pass
        
        return jsonify({
            "message": f"Failed to add product: {str(e)}",
            "success": False
        }), 500

@require_login(role = ["vendor"])
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

@require_login(role = ["vendor", "customer"])
def get_vendor_products(vendor_id):
    try:
        vendor = Vendor.query.get(vendor_id)
        if not vendor:
            return jsonify({
                "message": "Vendor not found",
                "success": False
            }), 404
        
        products = Product.query.filter_by(vendor_id=vendor_id).all()
        if not products:
            return jsonify({
                "message": "No products found for this vendor",
                "success": True,
                "products": []
            }), 200
        
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

@require_login(role = ["vendor"])
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
        return jsonify({"message": "系統錯誤，無法驗證 vendor_id", 
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
        
        return jsonify({"policy_id": add_discount_policy.id,
                        "message": "新增折價券成功",
                        "success": True}), 201 

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"資料庫錯誤: {str(e)}",
                        "success": False}), 500

@require_login(role = ["vendor", "customer"])
def view_discount_policy():
    data = request.get_json()
    '''
    預計傳給我{
    "vendor_id":XXX,
    }
    '''
    if not data:
        return jsonify({'message': '無效的請求數據', "success": False}), 400
    
    target_vendor_id = data.get("vendor_id")
    
    if not target_vendor_id:
        return jsonify({"message": "缺少 vendor_id", "success": False}), 400
    try:
        vendor_exists = Vendor.query.get(target_vendor_id)
        if vendor_exists is None:
            return jsonify({"message": "無效的 vendor_id", 
                            "success": False}), 400
    except Exception:
        return jsonify({"message": "系統錯誤，無法驗證 vendor_id", 
                        "success": False}), 500

    try:
        policies = Discount_Policy.query.filter_by(vendor_id=target_vendor_id).all()

        result_list = []
        policy_amount = len(policies)
        
        for policy in policies:
            formatted_date = policy.expiry_date.isoformat() if policy.expiry_date else None

            result_list.append({
                "policy_id": policy.id,
                "vendor_id": target_vendor_id,
                "type": str(policy.type),
                "value": policy.value,
                "min_purchase": policy.min_purchase,
                "max_discount": policy.max_discount,
                "membership_limit": policy.membership_limit,
                "expiry_date": formatted_date
            })

        return jsonify({
            "data": result_list,
            "policy_amount": policy_amount,
            "message": "discount_policies view",
            "success": True
        })
    except Exception as e:
        print(f"Error details: {e}")
        return jsonify({'message': '系統錯誤', 'error': str(e)}), 500




