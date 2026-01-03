# from config.database import db
# from sqlalchemy.orm import synonym
# from datetime import timezone, timedelta

# class Block_Record(db.Model):
#     __tablename__ = "block_records"
#     __table_args__ = {"schema": "auth"}

#     id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     admin_id    = db.Column(db.Integer, db.ForeignKey("auth.admins.user_id"), nullable=False)
#     user_id     = db.Column(db.Integer, db.ForeignKey("auth.users.id"), nullable=False)
#     reason      = db.Column(db.Text, nullable=False)
#     created_at  = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    
#     def __repr__(self):
#             return f"<Block_Record Admin:{self.admin_id} -> User:{self.user_id}>"
    
from config.database import db
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta, datetime

class Block_Record(db.Model):
    __tablename__ = "block_records"
    __table_args__ = {"schema": "auth"}

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id    = db.Column(db.Integer, db.ForeignKey("auth.admins.user_id"), nullable=False)
    user_id     = db.Column(db.Integer, db.ForeignKey("auth.users.id"), nullable=False)
    reason      = db.Column(db.Text, nullable=False)
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())

    @property
    def created_at(self) -> datetime | None:
        if self._created_at is None:
            return None
        time_tw = (
            self._created_at.replace(tzinfo=timezone.utc)
            .astimezone(timezone(timedelta(hours=8)))
            .replace(tzinfo=None)   # 移除 tzinfo，避免顯示 +08:00
        )
        return time_tw

    @created_at.setter
    def created_at(self, value):
        self._created_at = value

    created_at = synonym("_created_at", descriptor=created_at)

    def __repr__(self):
        return f"<Block_Record Admin:{self.admin_id} -> User:{self.user_id}>"

