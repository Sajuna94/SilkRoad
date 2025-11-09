from flask import Blueprint, jsonify

test_routes = Blueprint("test", __name__)

# for frontend testing purpose
@test_routes.route("/ping")
def ping():
    # Returns "pong" to show the backend is running
    return jsonify({"message": "pong"}), 401