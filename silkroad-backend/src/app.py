from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import init_db
from routes import user_routes, cart_routes, order_routes
from routes import admin_routes, vendor_routes
from utils import test_routes
from datetime import timedelta
from dotenv import load_dotenv
import os

def create_app():
    """Application Factory"""
    app = Flask(__name__)
    load_dotenv()
    app.secret_key = os.getenv("SESSION_KEY")

    app.config["SESSION_COOKIE_NAME"] = "flask_session"
    # app.config['SESSION_COOKIE_HTTPONLY'] = True  # 防止 JavaScript 存取 cookie
    # app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # 跨域必須設為 None
    # app.config['SESSION_COOKIE_SECURE'] = False  # 開發環境用 False,生產環境用 True(需要 HTTPS)
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)  # Session 有效期
    #app.config['SQLALCHEMY_ECHO'] = True
    
    CORS(app, 
        origins=["https://sajuna94.github.io", "http://localhost:5173"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    )

    # 初始化資料庫（只會在實際運行的進程中執行一次）
    print("[app] 初始化資料庫...")
    init_db(app)

    # 註冊路由
    print("[app] 註冊路由...")
    app.register_blueprint(test_routes, url_prefix="/api/test")
    app.register_blueprint(user_routes, url_prefix="/api/user")
    app.register_blueprint(cart_routes, url_prefix="/api/cart")
    app.register_blueprint(admin_routes, url_prefix="/api/admin")
    app.register_blueprint(order_routes, url_prefix="/api/order")
    app.register_blueprint(vendor_routes, url_prefix="/api/vendor")

    @app.route("/")
    def index():
        return "test"

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
        return send_from_directory(uploads_dir, filename)

    return app


def route_info_printer(app, bool_debug: bool = True):
    if not bool_debug:
        return
    print("[app] ========== 已註冊的路由 ==========")
    route_count = 0
    for rule in app.url_map.iter_rules():
        if rule.endpoint != "static":
            methods = ",".join(rule.methods - {"HEAD", "OPTIONS"})
            print(f"  {rule.rule:40} -> {rule.endpoint:30} [{methods}]")
            route_count += 1
    print(f"[app] 共註冊 {route_count} 個路由")
    print("[app] ===================================")


# 創建應用實例
app = create_app()

if __name__ == "__main__":
    # 只在子進程中打印路由信息
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        route_info_printer(app, True)
        print("[app] 啟動 Flask 伺服器...")
    app.run(debug=True)