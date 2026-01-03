from config.database import db
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

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
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())

    vendor = db.relationship("Vendor", back_populates="products")
    
    sugar_option = db.relationship("Sugar_Option", uselist=False, cascade="all, delete-orphan")
    ice_option = db.relationship("Ice_Option", uselist=False, cascade="all, delete-orphan")
    sizes_option = db.relationship("Sizes_Option", uselist=False, cascade="all, delete-orphan")

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

    def __repr__(self):
        return f"<Product {self.name} - Price {self.price}>"