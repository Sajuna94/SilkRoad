from config.database import db

class Cart_Item(db.Model):
    __tablename__ = "cart_items"
    __table_args__ = {"schema": "order"}

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cart_id         = db.Column(db.Integer, db.ForeignKey("order.carts.id"), nullable=False)
    product_id      = db.Column(db.Integer, db.ForeignKey("store.products.id"), nullable=False)
    quantity        = db.Column(db.Integer, nullable=False, server_default=db.text("1"))
    selected_sugar  = db.Column(db.String(50), nullable=True, comment='使用者選的甜度, e.g. 半糖')
    selected_ice    = db.Column(db.String(50), nullable=True, comment='使用者選的冰塊, e.g. 少冰')
    selected_size   = db.Column(db.String(20), nullable=True, comment='使用者選的大小, e.g. L')

    #relationship
    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product", primaryjoin="Cart_Item.product_id == Product.id", foreign_keys=[product_id], uselist=False)


    def __repr__(self):
        return f"<Cart_Item {self.id} - Cart {self.cart_id} - Item {self.product_id} - Quantity {self.quantity}>"
