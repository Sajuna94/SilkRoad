from config.database import db

class Block_Record(db.Model):
    __tablename__ = "block_records"
    __table_args__ = {"schema": "auth"}

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id    = db.Column(db.Integer, db.ForeignKey("auth.admins.user_id"), nullable=False)
    user_id     = db.Column(db.Integer, db.ForeignKey("auth.users.id"), nullable=False)
    reason      = db.Column(db.Text, nullable=False)
    created_at  = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    admin = db.relationship("Admin", backref="block_records", foreign_keys=[admin_id])
