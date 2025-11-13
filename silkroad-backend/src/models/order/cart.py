"""
Cart model : 定義購物車資料表結構 (SQLAlchemy ORM)
每個cart必須由一個 'user' 一個 'shop' 組成
"""
from config.database import db

class Cart(db.Model):
    __tablename__ = "carts"
    __table_args__ = {"schema": "order"}

    #database
    customer_id = db.Column(db.Integer, db.ForeignKey("auth.customers.user_id"), primary_key=True)
    vendor_id   = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    created_at  = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    #python
    # items = db.relationship("Cart_Item", back_populates="cart", cascade="all, delete-orphan")
    # customer = db.relationship("Customer", back_populates="cart")

    def clear(self):
        self.items.clear()

    def __repr__(self):
        return f"<Cart (customer_id={self.customer_id}, vendor_id={self.vendor_id})>"