"""
    By hansome young boy Etho
"""
from multiprocessing import Value
from sqlite3.dbapi2 import IntegrityError
from sqlalchemy.orm.session import exc
from typing_extensions import Required
from flask import jsonify, request
from models import Vendor, Product
from config.database import db


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
        
    try:        
        db.session.commit()
        return jsonify({
            "message": "Product updated successfully",
            "success": True
        }), 200
    except Exception as e:
            db.session.rollback()
            return jsonify({
                "message": f"Product update failed: {str(e)}",
                "success": False
            }), 400
