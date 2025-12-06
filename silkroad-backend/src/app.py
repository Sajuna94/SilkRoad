from flask import Flask, jsonify
from flask_cors import CORS
from config import init_db
from routes import user_routes, cart_routes, order_routes
from routes import admin_routes, vendor_routes, customer_routes
from utils import test_routes

from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()
app.secret_key = os.getenv('SESSION_KEY')

CORS(app, origins=[
    "https://sajuna94.github.io", 
    "http://localhost:5173",
    "http://localhost:5000"
], supports_credentials=True)

def route_info_printer(bool_debug: bool = True):
    if not bool_debug:
        return
    # 列印所有已註冊的路由（DEBUG）
    print("[app] ========== 已註冊的路由 ==========")
    route_count = 0
    for rule in app.url_map.iter_rules():
        if rule.endpoint != 'static':  # 忽略靜態檔案
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            print(f"  {rule.rule:40} -> {rule.endpoint:30} [{methods}]")
            route_count += 1
    print(f"[app] 共註冊 {route_count} 個路由")
    print("[app] ===================================")

# 初始化資料庫
print("[app] 初始化資料庫...")
init_db(app) 

# 註冊路由
print("[app] 註冊路由...")
app.register_blueprint(test_routes, url_prefix='/api/test')
app.register_blueprint(user_routes, url_prefix='/api/user')
app.register_blueprint(cart_routes, url_prefix='/api/cart')
app.register_blueprint(admin_routes,url_prefix='/api/admin')
app.register_blueprint(order_routes,url_prefix='/api/order')
app.register_blueprint(vendor_routes, url_prefix='/api/vendor')
app.register_blueprint(customer_routes, url_prefix='/api/customer')

from models import User  # 確認你的 User model 在 models.py

@app.route("/")
def index():
    users = User.query.all()  # 查詢所有 users
    # 將 users 轉換為 dict 以 jsonify
    users_list = []
    for u in users:
        users_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "password": u.password,
            "phone_number": u.phone_number,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return jsonify(users_list)

if __name__ == '__main__':
    route_info_printer(True)
    print("[app] 啟動 Flask 伺服器...")
    app.run(debug=True)


