"""
Cart model : 定義購物車資料表結構 (SQLAlchemy ORM)
每個cart必須由一個 'user' 一個 'shop' 組成
"""
from config.database import db
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

class Cart(db.Model):
    __tablename__ = "carts"
    __table_args__ = {"schema": "order"}

    #database
    customer_id = db.Column(db.Integer, db.ForeignKey("auth.customers.user_id"), primary_key=True)
    vendor_id   = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())

    @property
    def created_at(self):
        if self._created_at is None:
            return None
        time_tw = (
            self._created_at.replace(tzinfo=timezone.utc)
            .astimezone(timezone(timedelta(hours=8)))
            .replace(tzinfo=None)   # 移除 +08:00
        )
        return time_tw


    @created_at.setter
    def created_at(self, value):
        self._created_at = value

    created_at = synonym("_created_at", descriptor=created_at)

    #python
    items = db.relationship("Cart_Item", back_populates="cart", cascade="all, delete-orphan")
    # ref to class customer
    owner = db.relationship("Customer", back_populates="cart", uselist=False)

    def clear(self):
        self.items.clear()

    def __repr__(self):
        return f"<Cart (customer_id={self.customer_id}, vendor_id={self.vendor_id})>"
