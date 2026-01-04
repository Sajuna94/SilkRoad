from models import User
from config.database import db
from datetime import datetime, timedelta

def cleanup_unverified_users(app):
    """
    清理未驗證且過期的使用者帳號
    條件: is_verified=False 且 驗證碼過期時間已到
    """
    with app.app_context():
        try:
            # 找出過期的帳號 (寬限期: 驗證碼過期後再加 10 分鐘，共 20 分鐘)
            # 或者嚴格一點，只要 expires_at < now 就刪除
            threshold = datetime.now()
            
            users_to_delete = User.query.filter(
                User.is_verified == False,
                User.verification_code_expires_at < threshold
            ).all()

            if users_to_delete:
                count = len(users_to_delete)
                for user in users_to_delete:
                    db.session.delete(user)
                
                db.session.commit()
                print(f"[Scheduler] Cleaned up {count} unverified users.")
            else:
                pass
                # print("[Scheduler] No unverified users to clean.")

        except Exception as e:
            db.session.rollback()
            print(f"[Scheduler Error] Cleanup failed: {str(e)}")
