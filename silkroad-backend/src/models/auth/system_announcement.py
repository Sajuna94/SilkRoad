from config.database import db
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

class System_Announcement(db.Model):
    __tablename__ = "system_announcements"
    __table_args__ = {"schema": "auth"}

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id    = db.Column(db.Integer, db.ForeignKey("auth.admins.user_id"), nullable=False)
    message     = db.Column(db.Text, nullable=False)
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())

    @property
    def created_at(self):
        if self._created_at is None:
            return None
        time_tw = (
            self._created_at.replace(tzinfo=timezone.utc)
            .astimezone(timezone(timedelta(hours=8)))
            .replace(tzinfo=None)   # 移除 +08:00
        )
        return time_tw


    @created_at.setter
    def created_at(self, value):
        self._created_at = value

    created_at = synonym("_created_at", descriptor=created_at)

    def __repr__(self):
        return f"<System_Announcement {self.id}>"
