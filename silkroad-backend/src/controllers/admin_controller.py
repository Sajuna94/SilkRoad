#by Fan
from flask import request, jsonify
from models import Admin,Vendor,Customer
from models import Block_Record,System_Announcement
from config import db
from utils import require_login

def _toggle_user_status(target_active_status):
    """
    內部共用函式：用來切換使用者狀態
    target_active_status: True (解鎖) / False (封鎖)
    """
    data = request.get_json()
    admin_id = data.get('admin_id')
    target_user_id = data.get('target_user_id')
    
    # 只有在封鎖時 (False) 才強制需要 reason
    reason = data.get('reason') 

    # 1. 檢查參數
    if not all([admin_id, target_user_id]):
        return jsonify({"message": "Missing admin_id or target_user_id", "success": False}), 400
    
    if target_active_status is False and not reason:
        return jsonify({"message": "Blocking a user requires a 'reason'", "success": False}), 400

    # 2. 確認 Admin 權限
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"message": "Permission denied", "success": False}), 403

    # 3. 尋找目標 (共用邏輯)
    target_found = False
    target_type = None

    vendor = Vendor.query.get(target_user_id)
    if vendor:
        vendor.is_active = target_active_status # 設定狀態
        target_found = True
        target_type = "Vendor"
    
    if not target_found:
        customer = Customer.query.get(target_user_id)
        if customer:
            customer.is_active = target_active_status # 設定狀態
            target_found = True
            target_type = "Customer"

    if not target_found:
        return jsonify({"message": "User not found", "success": False}), 404

    # 4. 針對 "封鎖" 的特殊處理：寫入紀錄
    if target_active_status is False:
        new_record = Block_Record(
            admin_id=admin_id,
            user_id=target_user_id,
            reason=reason
        )
        db.session.add(new_record)

    try:
        db.session.commit()
        action = "unblocked" if target_active_status else "blocked"
        
        return jsonify({
            "success": True,
            "message": f"Successfully {action} {target_type}",
            "data": [{
                "target_user_id": target_user_id,
                "target_type": target_type,
                "status": "active" if target_active_status else "blocked",
                "reason": reason # 解鎖時可能是 None
            }]
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(e)}", "success": False}), 500

@require_login
def block_user():
    # 直接呼叫共用邏輯，傳入 False (封鎖)
    return _toggle_user_status(False)

@require_login
def unblock_user():
    # 直接呼叫共用邏輯，傳入 True (解鎖)
    return _toggle_user_status(True)

@require_login
def post_announcement():
    data = request.get_json()
    admin_id = data.get('admin_id')
    message = data.get('message')

    # 1. 檢查參數
    if not all([admin_id, message]):
        return jsonify({
            "message": "Missing admin_id or message",
            "success": False
        }), 400

    # 2. 確認操作者是否為 Admin
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({
            "message": "Permission denied, ID is not an admin",
            "success": False
        }), 403

    # 3. 建立公告
    new_announcement = System_Announcement(
        admin_id=admin_id,
        message=message
    )

    try:
        db.session.add(new_announcement)
        db.session.commit()
        
        # 成功回傳
        return jsonify({
            "success": True,
            "message": "Announcement posted successfully",
            "data": [{
                "announcement_id": new_announcement.id,
                "message": new_announcement.message,
                "created_at": new_announcement.created_at
            }]
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500
    

@require_login
def update_announcement(announcement_id):
    """
    更新公告內容
    """
    data = request.get_json()
    admin_id = data.get('admin_id')
    message = data.get('message')

    if not all([admin_id, message]):
        return jsonify({
            "message": "Missing admin_id or message",
            "success": False
        }), 400

    # 確認權限
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({
            "message": "Permission denied, ID is not an admin",
            "success": False
        }), 403

    # 尋找公告
    announcement = System_Announcement.query.get(announcement_id)
    if not announcement:
        return jsonify({
            "message": "Announcement not found",
            "success": False
        }), 404

    try:
        announcement.message = message
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Announcement updated successfully",
            "data": [{
                "announcement_id": announcement.id,
                "message": announcement.message,
                "updated_at": announcement.created_at # 若有 updated_at 欄位更好
            }]
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500


@require_login
def delete_announcement(announcement_id):
    """
    刪除公告
    """
    # 這裡因為 DELETE 方法通常不帶 Body，但為了權限檢查的一致性
    # 我們還是假設前端會傳 JSON Body 帶 admin_id，或者你可以改用 URL 參數
    # 這裡維持你的風格：從 JSON 拿 admin_id
    data = request.get_json() or {} 
    admin_id = data.get('admin_id')

    if not admin_id:
        return jsonify({
            "message": "Missing admin_id",
            "success": False
        }), 400

    # 確認權限
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({
            "message": "Permission denied, ID is not an admin",
            "success": False
        }), 403

    # 尋找公告
    announcement = System_Announcement.query.get(announcement_id)
    if not announcement:
        return jsonify({
            "message": "Announcement not found",
            "success": False
        }), 404

    try:
        db.session.delete(announcement)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Announcement deleted successfully",
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500