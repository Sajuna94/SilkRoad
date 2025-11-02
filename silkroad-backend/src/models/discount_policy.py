from ..config.database import db
from sqlalchemy import Enum

class Discount_Policy(db.Model):
    __tablename__ = "discount_policies"
    __table_args__ = {"schema": "order"}

    #database
    id               = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vendor_id        = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    type             = db.Column(Enum('percent', 'fixed'), nullable=False)
    value            = db.Column(db.Integer, nullable=False)
    min_purchase     = db.Column(db.Integer, server_default=db.text("0"))
    max_discount     = db.Column(db.Integer)
    membership_limit = db.Column(db.Integer, nullable=False, server_default=db.text("0"))
    expiry_date      = db.Column(db.Date)
    created_at       = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at       = db.Column(db.DateTime, nullable=False, server_default=db.func.now())  
    'TODO: Add ON UPDATE ON UPDATE CURRENT_TIMESTAMP (follow database aka main.sql)'

    #python
    vendor = db.relationship("Vendor", back_populates="discount_policies")

    def __repr__(self):
        return f"<DiscountPolicy {self.policy_name} - {self.discount_rate*100}%>"