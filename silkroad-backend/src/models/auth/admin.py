from models.auth.user import User
from sqlalchemy import Column, Integer, ForeignKey

class Admin(User):
    __tablename__ = "admins"
    __table_args__ = {"schema": "auth"}

    user_id = Column(Integer, ForeignKey("auth.users.id"), primary_key=True)
        
    def __repr__(self):
        return f"<Admin {self.name}>"