from models.auth.user import User
from config import db

class Admin(User):
    __tablename__ = "admins"
    __table_args__ = {"schema": "auth"}
    __mapper_args__ = {
        'polymorphic_identity': 'admin',
    }

    user_id = db.Column(db.Integer, db.ForeignKey("auth.users.id"), primary_key=True)

    def __repr__(self):
        return f"<Admin {self.name}>"
