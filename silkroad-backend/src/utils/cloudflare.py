from flask import Blueprint, jsonify

import cloudinary
import cloudinary.utils
import time
import os

cloudinary_routes = Blueprint("cloudinary", __name__)


# Could use env variables to store sensitive info
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_NAME"),  # Replace with your Cloudinary cloud name
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),  # Replace with your Cloudinary API secret
)

# Maybe folder name could name by "vendor_{vendor_id}/product_images"
# Maybe need @login_required decorator or other auth methods
@cloudinary_routes.route("/cloudinary-signature", methods=["GET"])
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