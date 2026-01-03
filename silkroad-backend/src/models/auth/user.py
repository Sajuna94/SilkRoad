from config.database import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import synonym
from datetime import timezone, timedelta

# 定義一個 User 類別，代表資料庫中的 "users" 資料表
class User(db.Model):
    #指定這個模型所對應的資料表名稱
    __tablename__ = 'users'
    __table_args__ = {"schema" : "auth"}  #指定schema
    __mapper_args__ = {
        'polymorphic_identity': 'user',
        'polymorphic_on': "role"
    }

    #定義columns
    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name            = db.Column(db.Text)
    email           = db.Column(db.String(255), unique=True, nullable = False)
    password        = db.Column(db.String(255), nullable=False)
    phone_number    = db.Column(db.String(25), unique=True, nullable = False)
    role            = db.Column(db.String(20), nullable=False)
    _created_at = db.Column("created_at", db.DateTime, nullable=False, server_default=db.func.now())

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

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    # 用來定義物件在印出或除錯時的 " 字串表示方式 "
    def __repr__(self):
        return f'<User {self.name}>'

    """
    基礎註冊方法：
    1. 接收共用參數
    2. 進行密碼雜湊
    3. 接收 **kwargs (子類別特有的參數，如 address)
    4. 回傳一個尚未 commit 的物件 (cls 會是 User, Vendor 或 Customer)
    """
    # cls(...) 會呼叫當前類別的建構函式
    # 如果是 Vendor.register(...)，這裡的 cls 就是 Vendor
    # **kwargs 會把剩下的參數 (如 address, vendor_manager_id) 傳進去
    @classmethod
    def register(cls, name, email, password, phone_number, **kwargs):
        # 1. 檢查 Email 是否重複
        # 注意：使用 cls.query 或 User.query 都可以
        if cls.query.filter_by(email=email).first():
            raise ValueError("Email has been registered")

        # 2. 檢查電話是否重複
        if cls.query.filter_by(phone_number=phone_number).first():
            raise ValueError("Phone number has been registered")

        # 3. 執行原本的建立邏輯
        hashed_password = generate_password_hash(password)
        
        instance = cls(
            name=name,
            email=email,
            password=hashed_password,
            phone_number=phone_number,
            **kwargs 
        )
        return instance