from config.database import db
from sqlalchemy import Enum
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

class Discount_Policy(db.Model):
    __tablename__ = "discount_policies"
    __table_args__ = {"schema": "order"}

    #database
    id               = db.Column(db.Integer, primary_key=True, autoincrement=True)
    vendor_id        = db.Column(db.Integer, db.ForeignKey("auth.vendors.user_id"), nullable=False)
    code             = db.Column(db.String(20))  # VARCHAR(20)
    is_available     = db.Column(db.Boolean, nullable = False)
    type             = db.Column(Enum('percent', 'fixed'), nullable=False)
    value            = db.Column(db.Integer, nullable=False)
    min_purchase     = db.Column(db.Integer, server_default=db.text("0"))
    max_discount     = db.Column(db.Integer)
    membership_limit = db.Column(db.Integer, nullable=False, server_default=db.text("0"))
    start_date       = db.Column(db.Date, nullable=False, server_default=db.func.current_date())
    expiry_date      = db.Column(db.Date)
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())
    updated_at       = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    'TODO: Add ON UPDATE ON UPDATE CURRENT_TIMESTAMP (follow database aka main.sql)'

    #python
    # vendor = db.relationship("Vendor", back_populates="discount_policies")

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
        return f"<DiscountPolicy id={self.id} code={self.code} type={self.type} value={self.value}>"