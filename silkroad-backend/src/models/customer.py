from config.database import db
from models.user import User


class Customer(User):
    __tablename__ = "customers"
    __table_args__ = {"schema" : "auth"}

    user_id           = db.Column(db.Integer, db.ForeignKey("auth.users.id"), primary_key=True)
    membership_level  = db.Column(db.Integer, nullable=False, server_default=db.text("0"))
    is_active         = db.Column(db.Boolean, nullable=False, server_default=db.text("true"))
    stored_balance    = db.Column(db.Integer, nullable=False, server_default=db.text("0"))
    address           = db.Column(db.String(225), nullable=False)
    created_at        = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    def __repr__(self):
        return f"<Customer {self.name}>"
    
    