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
    

def switcher(user_bhvr, guest_bhvr):
    """
    根據登入狀態切換處理函數
    if login return function user_behavior
    else return function guest_behavior 
    (not the result of the function just function)
    """
    @wraps(user_bhvr)
    def wrapper(*args, **kwargs):
        handler = guest_bhvr if "user_id" not in session or "role" not in session else user_bhvr
        return handler(*args, **kwargs)
    return wrapper