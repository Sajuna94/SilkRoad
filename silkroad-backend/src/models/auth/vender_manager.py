from config.database import db

class Vender_Mananger(db.Model):
    __tablename__ = "vendor_managers"
    __table_args__ = {"schema": "auth"}

    id           = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    name         = db.Column(db.Text)
    email        = db.Column(db.String(255), unique=True, nullable = False)
    phone_number = db.Column(db.String(25), nullable = False, unique=True)
    created_at   = db.Column(db.DateTime, nullable = False, server_default = db.func.now())