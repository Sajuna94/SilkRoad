from config.database import db
from models.auth.user import User

"""
NOTE:
    id, manager should be completed
"""
class Vendor(User):
    __tablename__ = "vendors"
    __table_args__ = {"schema" : "auth"}
    __mapper_args__ = {
        'polymorphic_identity': 'vendor'
    }
    user_id             = db.Column( db.Integer, db.ForeignKey("auth.users.id"), primary_key=True)
    vendor_manager_id   = db.Column(db.Integer, db.ForeignKey("auth.vendor_managers.id"), nullable = False)
    is_active           = db.Column(db.Boolean, nullable = False, server_default = db.text('true'))
    revenue             = db.Column(db.Integer, nullable = False, server_default = db.text('0'))
    address             = db.Column(db.String(255) , unique = True, nullable = False)
    description         = db.Column(db.Text, nullable=True)
    logo_url            = db.Column(db.String(255), nullable=True)
    products = db.relationship("Product", back_populates="vendor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Shop {self.name}>"
