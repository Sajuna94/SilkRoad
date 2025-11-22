"""
    By hansome young boy Etho
"""
from sqlite3.dbapi2 import IntegrityError
from flask import jsonify, request
from models import Vendor, Vendor_Manager
from src.config.database import db

def register_vendor():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "message": "...",
                "success": False
            }), 400

        necessary = ["name", "email", "password", "phone_number", "address", "manager"]
        missing = [field for field in necessary if not data.get(field)]
        if missing:
            return jsonify({
                "message": f"Missing fields: {', '.join(missing)}",
                "success": False
            }), 400

        mgr = data.get("manager")
        if not isinstance(mgr, dict):
            return jsonify({
                "message": "mgr must be a json object",
                "success": False
            }), 400

        mgr_necessary = ["name", "email", "phone_number"]
        mgr_missing = [field for field in mgr_necessary if not mgr.get(field)]
        if mgr_missing:
            return jsonify({
                "message": f"Missing manager fields: {', '.join(mgr_missing)}",
                "success": False
            }), 400

        vndr_mgr = Vendor_Manager(
            name=mgr.get("name"),
            email=mgr.get("email"),
            phone_number=mgr.get("phone_number")
        )
        db.session.add(vndr_mgr)
        db.session.flush()

        vndr = Vendor(
            name=data.get("name"),
            email=data.get("email"),
            phone_number=data.get("phone_number"),
            address=data.get("address"),
            vendor_manager_id=vndr_mgr.id
        )
        vndr.set_password(data.get("password"))

        db.session.add(vndr)
        db.session.commit()
        return jsonify({
            "message": "Vendor created successfully",
            "success": True,
        }), 201
    except IntegrityError as e:

        db.session.rollback()
        # 處理唯一性約束違反（如重複的 email 或 phone_number）
        error_msg = str(e.orig)
        if "email" in error_msg:
            return jsonify({
                "message": "Email already exists",
                "success": False
            }), 409
        elif "phone_number" in error_msg:
            return jsonify({
                "message": "Phone number already exists",
                "success": False
            }), 409
        elif "address" in error_msg:
            return jsonify({
                "message": "Address already exists",
                "success": False
            }), 409
        else:
            return jsonify({
                "message": f"Database integrity error: {str(e)}",
                "success": False
            }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Error registering vendor: {str(e)}",
            "success": False
        }), 500

def login_vendor():
    # Implement login logic here
    return jsonify({"message": "Vendor logged in successfully"}), 200
