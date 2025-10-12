from config import db
from datetime import datetime

class Shop(db.Model):
    __tablename__ = "shops"

    shop_id = db.Column(db.Integer, primary_key=True)
    shop_name = db.Column(db.String(100), nullable=False)
    hasdelivery = db.Column(db.Boolean, default=False)
    luanch_time = db.Column(db.Time, nullable=False)    #if neccessary

    def __repr__(self):
        return f"<Shop {self.shop_name}>"