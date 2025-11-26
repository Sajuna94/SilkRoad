from flask import session, jsonify

def require_login(func):
    """裝飾器，每次呼叫都驗證 session"""
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({
                "message": "請先登入",
                "success": False
            }), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper
    
