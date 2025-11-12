"""
    =============================================================================
    This file is the basic test for any functionality you want to try out.
    The path is /api/test/...
    =============================================================================
"""

from flask import Blueprint, jsonify
from models.auth.user import User
from config import db

test_routes = Blueprint("test", __name__)


# for frontend testing purpose
@test_routes.route("/ping", methods=["GET"])
def ping():
    # Returns "pong" to show the backend is running
    return jsonify({"message": "pong"}), 401


# CURD test route
@test_routes.route("/Insert")
def test_insert():
    try:
        new_user = User(
            name="Test User",
            email="testuser@example.com",
            password="12434544",  # 密碼要 hash
            phone_number="0912345678"
        )

        # 加入 session
        db.session.add(new_user)  
        db.session.commit()
        return {"status": "insert success"}
    except Exception as e:
        return {"error": str(e)}

@test_routes.route("/Update")
def test_update():
    usr = User.query.get(1)
    if not usr: 
        return jsonify({"error": "user.1 not found"}), 404
    usr.name = "Gay"
    try:
        db.session.commit()
        return jsonify({"message": "user.1 name changed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@test_routes.route("/Delete")
def test_delete():
    usr = User.query.filter_by(id=1).first()
    if not usr: 
        return jsonify({"error": "user.1 not found"}), 404
    try:
        db.session.delete(usr)
        db.session.commit()
        return jsonify({"message": "user.1 deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@test_routes.route("/Select")
def test_select():
    usr = User.query.filter_by(id=1).first()
    if usr:
        return jsonify({
            "id": usr.id,
            "name": usr.name,
            "email": usr.email,
            "phone_number": usr.phone_number,
            "created_at": usr.created_at
        })
    return jsonify({"error": "user.1 not found"}), 404

'''
NOTE: 這段code的依賴本身沒有寫到pyproject.toml裡面
      如果讓它運行會導致module not found error
      所以先把它註解起來
'''
# for cloudinary upload signature generation
import cloudinary
import cloudinary.utils
import time

# Could use env variables to store sensitive info
cloudinary.config(
    cloud_name="your_cloud_name",  # Replace with your Cloudinary cloud name
    api_key="your_api_key",
    api_secret="your_api_secret",  # Replace with your Cloudinary API secret
)


# Maybe folder name could name by "vendor_{vendor_id}/product_images"
# Maybe need @login_required decorator or other auth methods
@test_routes.route("/cloudinary-signature", methods=["GET"])
def generate_signature():
    timestamp = int(time.time())
    folder_name = "your_folder_name"  # TODO: Replace with your desired folder name
    params = {
        "timestamp": timestamp,
        "folder": folder_name,
    }
    signature = cloudinary.utils.api_sign_request(
        params, cloudinary.config().api_secret
    )
    return jsonify(
        {
            "api_key": cloudinary.config().api_key,
            "timestamp": timestamp,
            "signature": signature,
            "folder": folder_name,
            "cloud_name": cloudinary.config().cloud_name,
        }
    )

# for testing database connection and ORM
from models.auth.vendor import Vendor

# Maybe need @login_required decorator or other auth methods
@test_routes.route("/vendors/<int:vendor_id>", methods=["GET"])
def get_vendor_by_id(vendor_id):
    vendor = Vendor.query.get(vendor_id)
    if vendor:
        return jsonify({"id": vendor.id, "name": vendor.name, "email": vendor.email})
    return jsonify({"error": "Vendor not found"}), 404
