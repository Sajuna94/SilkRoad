from flask import Blueprint, jsonify

test_routes = Blueprint("test", __name__)

# for frontend testing purpose
@test_routes.route("/ping", methods=["GET"])
def ping():
    # Returns "pong" to show the backend is running
    return jsonify({"message": "pong"}), 401

# for cloudinary upload signature generation
import cloudinary
import cloudinary.utils
import time

# Could use env variables to store sensitive info
cloudinary.config(
    cloud_name = "your_cloud_name",  # Replace with your Cloudinary cloud name
    api_key = "your_api_key",
    api_secret = "your_api_secret"  # Replace with your Cloudinary API secret
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
    signature = cloudinary.utils.api_sign_request(params, cloudinary.config().api_secret)
    return jsonify({
        "api_key": cloudinary.config().api_key,
        "timestamp": timestamp,
        "signature": signature,
        "folder": folder_name,
        "cloud_name": cloudinary.config().cloud_name,
    }) 
