from config.database import db
from werkzeug.security import generate_password_hash, check_password_hash

from sqlalchemy import Column, Integer, String, DateTime, Text

# 定義一個 User 類別，代表資料庫中的 "users" 資料表
class User(db.Model):
    #指定這個模型所對應的資料表名稱
    __tablename__ = 'users'
    __table_args__ = {"schema" : "auth"}  #指定schema

    #定義columns
    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name            = db.Column(db.Text)
    email           = db.Column(db.String(255), unique=True, nullable = False)
    password        = db.Column(db.String(255), nullable=False)
    phone_number    = db.Column(db.String(25), unique=True, nullable = False) 
    created_at      = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    # 用來定義物件在印出或除錯時的 " 字串表示方式 "    
    def __repr__(self):
        return f'<User {self.username}>'