from ..config.database import db

class Order_Item(db.Model):
    __tablename__ = "order_items"
    __table_args__ = {"schema" : "order"}

    order_id    = db.Column(db.Integer, db.ForeignKey("order.orders.id"), primary_key=True, nullable=False)
    product_id  = db.Column(db.Integer, db.ForeignKey("store.products.id"), primary_key=True, nullable=False)
    quantity    = db.Column(db.Integer, nullable=False)