from config.database import db

class Cart_Item(db.Model):
    __tablename__ = "cart_items"
    __table_args__ = {"schema": "order"}

    cart_id = db.Column(db.Integer, db.ForeignKey("order.carts.customer_id"), primary_key=True, nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("store.products.id"), primary_key=True, nullable=False)
    quantity  = db.Column(db.Integer, nullable=False, server_default=db.text("1"))

    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product")

    

    def __repr__(self):
        return f"<CartItem {self.cart_item_id} - Cart {self.cart_id} - Item {self.item_id} - Quantity {self.quantity}>"