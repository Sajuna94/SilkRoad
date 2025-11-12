from flask import Flask, jsonify
from flask_cors import CORS
from config import init_db
from routes import user_routes, cart_routes, shop_routes, test_routes

app = Flask(__name__)

CORS(app, origins=[
    "https://sajuna94.github.io", 
    "http://localhost:5173"
])

# 初始化資料庫
# init_db(app)

# 註冊路由
app.register_blueprint(test_routes, url_prefix='/api')
app.register_blueprint(user_routes, url_prefix='/api/user')

@app.route("/")
def index():
    return "test"

if __name__ == '__main__':
    app.run(debug=True)