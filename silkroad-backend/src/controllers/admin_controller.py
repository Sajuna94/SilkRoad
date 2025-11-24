#by Fan
from flask import request, jsonify
from models import Admin,Vendor,Customer
from models import Block_Record,System_Announcement
from config import db

def block_user():
    data = request.get_json()
    admin_id = data.get('admin_id')
    target_user_id = data.get('target_user_id')
    reason = data.get('reason')

    # 1. 檢查參數
    if not all([admin_id, target_user_id, reason]):
        return jsonify({
            "message": "Missing admin_id, target_user_id or reason",
            "success": False
        }), 400

    # 2. 確認操作者是否為 Admin
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({
            "message": "Permission denied, ID is not an admin",
            "success": False
        }), 403

    # 3. 尋找目標使用者並設定 is_active = False
    target_found = False
    target_type = None

    # 嘗試找 Vendor
    vendor = Vendor.query.get(target_user_id)
    if vendor:
        vendor.is_active = False
        target_found = True
        target_type = "Vendor"
    
    # 如果不是 Vendor，嘗試找 Customer
    if not target_found:
        customer = Customer.query.get(target_user_id)
        if customer:
            customer.is_active = False
            target_found = True
            target_type = "Customer"

    if not target_found:
        return jsonify({
            "message": "User not found or cannot be blocked (e.g. User or Admin)",
            "success": False
        }), 404

    # 4. 建立封鎖紀錄 (Block Record)
    new_record = Block_Record(
        admin_id=admin_id,
        user_id=target_user_id,
        reason=reason
    )

    try:
        db.session.add(new_record)
        db.session.commit()
        
        # 成功回傳，將結果包在 data List 中
        return jsonify({
            "success": True,
            "message": f"Successfully blocked {target_type}",
            "data": [{
                "target_user_id": target_user_id,
                "target_type": target_type,
                "status": "blocked",
                "reason": reason
            }]
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Database error: {str(e)}",
            "success": False
        }), 500


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