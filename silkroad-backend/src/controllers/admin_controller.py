from flask import request, jsonify
from models import Admin,Vendor,Customer
from models import Block_Record,System_Announcement
from config import db
def block_user():
    """
    Admin 封鎖使用者 (Vendor 或 Customer)
    Payload 範例:
    {
        "admin_id": 1,          <-- 因為沒有 JWT，需手動傳入操作者的 ID
        "target_user_id": 5,    <-- 要被封鎖的人
        "reason": "違反使用者規範"
    }
    """
    data = request.get_json()
    admin_id = data.get('admin_id')
    target_user_id = data.get('target_user_id')
    reason = data.get('reason')

    # 1. 檢查參數
    if not all([admin_id, target_user_id, reason]):
        return jsonify({"message": "缺少 admin_id, target_user_id 或 reason"}), 400

    # 2. 確認操作者是否為 Admin
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"message": "權限不足，該 ID 非管理員"}), 403

    # 3. 尋找目標使用者並設定 is_active = False
    # 由於 User 表沒有 is_active，我們必須分別檢查 Vendor 和 Customer
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
        return jsonify({"message": "找不到該使用者，或該使用者類型無法被封鎖 (如普通 User 或其他 Admin)"}), 404

    # 4. 建立封鎖紀錄 (Block Record)
    new_record = Block_Record(
        admin_id=admin_id,
        user_id=target_user_id,
        reason=reason
    )

    try:
        db.session.add(new_record)
        db.session.commit()
        return jsonify({
            "message": f"已成功封鎖 {target_type}",
            "target_user_id": target_user_id,
            "status": "blocked"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def post_announcement():
    """
    Admin 發布系統公告
    Payload 範例:
    {
        "admin_id": 1,
        "title": "系統維護通知",
        "message": "本系統將於今晚進行維護..."
    }
    """
    data = request.get_json()
    admin_id = data.get('admin_id')
    message = data.get('message')

    # 1. 檢查參數
    if not all([admin_id, message]):
        return jsonify({"message": "缺少 admin_id 或 message"}), 400

    # 2. 確認操作者是否為 Admin
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({"message": "權限不足，該 ID 非管理員"}), 403

    # 3. 建立公告
    new_announcement = System_Announcement(
        admin_id=admin_id,   # 記得要在你的 Model 中確認有這個欄位，或者只存 message
        message=message
    )

    try:
        db.session.add(new_announcement)
        db.session.commit()
        return jsonify({
            "message": "公告發布成功", 
            "announcement_id": new_announcement.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500