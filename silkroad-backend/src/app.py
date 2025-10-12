from flask import Flask
from config import init_db
from routes import *


app = Flask(__name__)

# 初始化資料庫
init_db(app)

# 註冊路由
app.register_blueprint(user_routes, url_prefix='/api/user')


#for test, see test/__init__.py
# from test import test_routes
# app.register_blueprint(test_routes, url_prefix='/api/test')


if __name__ == '__main__':
    app.run(debug=True)