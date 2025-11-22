from flask import Blueprint
from controllers import register_user, login_user

user_routes = Blueprint('user', __name__)

user_routes.route('/register', methods=['POST'])(register_user)
"""
User註冊
範例:
{
    "name" = XXX,
    "email" = XXX,
    "password" = XXX,
    "phone_number" = XXX
}
return 
{
    "message": "使用者註冊成功"
}
"""
user_routes.route('/login', methods=['POST'])(login_user)
"""
User登入
範例:
{
    "email" = XXX,
    "password" = XXX
}
return 
{
    "id"=XXX,
    "name"=XXX,
    "email"=XXX
}
"""