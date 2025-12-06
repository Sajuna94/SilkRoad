from config.database import db

class Review(db.Model):
    __tablename__ = "reviews"

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id     = db.Column(db.Integer, db.ForeignKey("auth.customers.user_id"), nullable=False)
    vendor_id       = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    rating          = db.Column(db.Integer, nullable=False)
    review_content  = db.Column(db.Text)
    created_at      = db.Column(db.DateTime, nullable=False, default=db.func.now())

    __table_args__ = (
        db.UniqueConstraint('customer_id', 'vendor_id', name='customer_vendor_unique_idx'),
        {"schema": "store"}
    )

    def __repr__(self):
        return f"<Review Rating:{self.rating} Customer:{self.customer_id} -> Vendor:{self.vendor_id}>"