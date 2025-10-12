"""
Cart model : 定義購物車資料表結構 (SQLAlchemy ORM)
每個cart必須由一個 'user' 一個 'shop' 組成
"""
from config import db

class Cart(db.Model):
    __tablename__ = "carts"

    cart_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shop_id = db.Column(db.Integer, nullable=False)
    item = ...  #item 可能會是另一個entity，之後實做

    def __repr__(self):
        return f"<Cart {self.cart_id} - User {self.user_id} - Item {self.item_id}>"