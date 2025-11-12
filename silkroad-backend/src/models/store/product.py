from config.database import db

class Product(db.Model):
    __tablename__ = "products"
    __table_args__ = {"schema" : "store"}

    id           = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vendor_id    = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    name         = db.Column(db.String(50), nullable=False)
    price        = db.Column(db.Integer, nullable=False)
    description  = db.Column(db.Text)
    image_url    = db.Column(db.String(255), unique=True)
    is_listed    = db.Column(db.Boolean, nullable=False, server_default=db.text("true"))
    created_at   = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    vendor = db.relationship("Vendor", back_populates="products")

    def __repr__(self):
        return f"<Product {self.name} - Price {self.price}>"