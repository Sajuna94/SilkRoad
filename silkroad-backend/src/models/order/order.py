from config.database import db
from sqlalchemy import Enum

class Order(db.Model):
    __tablename__ = "orders"
    __table_args__ = {"schema" : "order"}

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("auth.users.id"), nullable=False)
    vendor_id       = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    policy_id       = db.Column(db.Integer, db.ForeignKey("order.discount_policies.id"))
    total_price     = db.Column(db.Integer, nullable=False)
    note            = db.Column(db.Text)
    payment_methods = db.Column(Enum('cash', 'credit'), nullable=False)
    refund_status   = db.Column(Enum('refunded', 'rejected'))
    refund_at       = db.Column(db.DateTime)
    is_completed    = db.Column(db.Boolean, nullable=False, server_default=db.text('false'))
    is_delivered    = db.Column(db.Boolean, nullable=False)
    created_at      = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    updated_at      = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    items = db.relationship("Order_Item", back_populates="order", cascade="all, delete-orphan")