from config.database import db
from sqlalchemy import Enum

from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

class Order(db.Model):
    __tablename__ = "orders"
    __table_args__ = {"schema" : "order"}

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("auth.users.id"), nullable=False)
    vendor_id       = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    policy_id       = db.Column(db.Integer, db.ForeignKey("order.discount_policies.id"))
    total_price     = db.Column(db.Integer, nullable=False)
    note            = db.Column(db.Text)
    payment_methods = db.Column(Enum('cash', 'button'), nullable=False)
    refund_status   = db.Column(Enum('pending', 'refunded', 'rejected'))
    refund_at       = db.Column(db.DateTime)
    is_completed    = db.Column(db.Boolean, nullable=False, server_default=db.text('false'))
    is_delivered    = db.Column(db.Boolean, nullable=False)
    _created_at     = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())  # 修正這裡
    updated_at      = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    discount_amount = db.Column(db.Integer, nullable=False, default=0)
    address_info    = db.Column(db.String(255))
    deliver_status  = db.Column(Enum('delivering', 'delivered'), nullable=True)
    items           = db.relationship("Order_Item", back_populates="order", cascade="all, delete-orphan")

    @property
    def created_at(self):
        if self._created_at is None:
            return None
        time_tw = (
            self._created_at.replace(tzinfo=timezone.utc)
            .astimezone(timezone(timedelta(hours=8)))
            .replace(tzinfo=None)
        )
        return time_tw

    @created_at.setter
    def created_at(self, value):
        self._created_at = value

    created_at = synonym("_created_at", descriptor=created_at)

    def __repr__(self):
        return f"<Order {self.id}>"
