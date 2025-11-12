from config.database import db
from models.auth.user import User

class Admin(User):
    __tablename__ = "admins"
    __table_args__ = {"schema": "auth"}

    user_id = db.Column(db.Integer, db.ForeignKey("auth.users.id"), primary_key=True)


    def __repr__(self):
        return f"<Admin {self.name}>"