from flask import session, jsonify
from functools import wraps

def require_login(role):
    
    def decorator(func):
        """裝飾器，每次呼叫都驗證 session"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            if "user_id" not in session or "role" not in session:
                return jsonify({
                    "message": "請先登入",
                    "success": False
                }), 401   
            if session["role"] not in role:
                return jsonify({
                    "message": "權限不足",
                    "success": False
                }), 403
                
            return func(*args, **kwargs)
            
        return wrapper
    return decorator
    
