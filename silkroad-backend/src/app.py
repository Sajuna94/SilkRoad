from flask import Flask, jsonify
from flask_cors import CORS
from config import init_db
from routes import user_routes, cart_routes, shop_routes, test_routes

app = Flask(__name__)

CORS(app, origins=[
    "https://sajuna94.github.io", 
    "http://localhost:5173",
    "http://localhost:5000"
])

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
app.register_blueprint(test_routes, url_prefix='/api')
# app.register_blueprint(user_routes, url_prefix='/api/user')
# app.register_blueprint(cart_routes, url_prefix='/api/cart')
# app.register_blueprint(shop_routes, url_prefix='/api/shop')

@app.route("/")
def index():
    return "test"

from config.database import db
from sqlalchemy import text
from models.auth.user import User

@app.route("/test-insert")
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

if __name__ == '__main__':
    route_info_printer(True)
    print("[app] 啟動 Flask 伺服器...")
    app.run(debug=True)


