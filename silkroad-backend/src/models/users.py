from config import db
from datetime import datetime

# 定義一個 User 類別，代表資料庫中的 "users" 資料表
class User(db.Model):
    #指定這個模型所對應的資料表名稱
    __tablename__ = 'users'

    #定義columns
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)    #for something member event
    ...
    
    # 用來定義物件在印出或除錯時的 " 字串表示方式 "    
    def __repr__(self):
        return f'<User {self.username}>'