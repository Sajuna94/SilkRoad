from config.database import db
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

class Review(db.Model):
    __tablename__ = "reviews"

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id        = db.Column(db.Integer, db.ForeignKey("order.orders.id"), nullable=False)
    customer_id     = db.Column(db.Integer, db.ForeignKey("auth.customers.user_id"), nullable=False)
    vendor_id       = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    rating          = db.Column(db.Integer, nullable=False)
    review_content  = db.Column(db.Text)
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint('order_id', name='unique_order_review'),
        {"schema": "store"}
    )

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
        return f"<Review Rating:{self.rating} Customer:{self.customer_id} -> Vendor:{self.vendor_id}>"