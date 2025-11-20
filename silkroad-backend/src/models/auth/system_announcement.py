from config.database import db
class System_Announcement(db.Model):
    __tablename__ = "system_announcements"
    __table_args__ = {"schema": "auth"}

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id    = db.Column(db.Integer, db.ForeignKey("auth.admins.user_id"), nullable=False)
    message     = db.Column(db.Text, nullable=False)
    created_at  = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    
    def __repr__(self):
        return f"<System_Announcement {self.id}>"
    
