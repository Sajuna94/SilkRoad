from flask import Flask, jsonify
from flask_cors import CORS
from config import init_db
from routes import user_routes, cart_routes, shop_routes


app = Flask(__name__)

CORS(app, origins=[
    "https://sajuna94.github.io", 
    "http://localhost:5173"
])

# 初始化資料庫
init_db(app)

# 註冊路由
app.register_blueprint(user_routes, url_prefix='/api/user')

# for frontend testing purpose
# @app.route("/api/ping")
# def ping():
#     # Returns "pong" to show the backend is running
#     return jsonify({"message": "pong"})

if __name__ == '__main__':
    app.run(debug=True)