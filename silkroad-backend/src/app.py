from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import init_db
from routes import user_routes, cart_routes, order_routes
from routes import admin_routes, vendor_routes
from utils import test_routes
from datetime import timedelta

from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()
app.secret_key = os.getenv('SESSION_KEY')

app.config['SESSION_COOKIE_NAME'] = 'flask_session'
# app.config['SESSION_COOKIE_HTTPONLY'] = True  # 防止 JavaScript 存取 cookie
# app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # 跨域必須設為 None
# app.config['SESSION_COOKIE_SECURE'] = False  # 開發環境用 False,生產環境用 True(需要 HTTPS)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)  # Session 有效期
#app.config['SQLALCHEMY_ECHO'] = True
CORS(app, 
    origins=[
    "https://sajuna94.github.io", 
    "http://localhost:5173"],
    supports_credentials=True,  # 允許傳送 cookie(最重要!)
    allow_headers=['Content-Type', 'Authorization'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

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

@app.route("/")
def index():
    return "test"

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """提供上傳的檔案（如產品圖片）"""
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
    return send_from_directory(uploads_dir, filename)

if __name__ == '__main__':
    route_info_printer(True)
    print("[app] 啟動 Flask 伺服器...")
    app.run(debug=True)


