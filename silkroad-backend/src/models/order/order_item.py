from config.database import db

class Order_Item(db.Model):
    __tablename__ = "order_items"
    __table_args__ = {"schema" : "order"}

    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id    = db.Column(db.Integer, db.ForeignKey("order.orders.id"), primary_key=True, nullable=False)
    product_id  = db.Column(db.Integer, db.ForeignKey("store.products.id"), primary_key=True, nullable=False)
    quantity    = db.Column(db.Integer, nullable=False)
    price       = db.Column(db.Integer, nullable=False)
    selected_sugar  = db.Column(db.String(50), nullable=True, comment='使用者選的甜度, e.g. 半糖')
    selected_ice    = db.Column(db.String(50), nullable=True, comment='使用者選的冰塊, e.g. 少冰')
    selected_size   = db.Column(db.String(20), nullable=True, comment='使用者選的大小, e.g. L')

    order = db.relationship("Order", back_populates="items")
    product = db.relationship("Product", primaryjoin="Order_Item.product_id == Product.id", foreign_keys=[product_id], uselist=False)