from config import db

class Sizes_Option(db.Model):
    __tablename__ = 'sizes_options'
    __table_args__ = {"schema" : "store"}

    product_id = db.Column(db.Integer, db.ForeignKey('store.products.id') ,primary_key=True)
    options = db.Column(db.Text, nullable=False)
    price_step = db.Column(db.Integer, nullable=False, default=0) 

    def get_details(self, base_price):
        """
        回傳計算後的詳細價格列表
        """
        raw_list = [opt.strip() for opt in self.options.split(',') if opt.strip()]
        result = []
        
        for index, name in enumerate(raw_list):
            # 公式： 加價 = 索引 * 階層金額
            # S (index 0) => 加 0 * 10 = 0
            # M (index 1) => 加 1 * 10 = 10
            # L (index 2) => 加 2 * 10 = 20
            delta = index * self.price_step
            
            result.append({
                "name": name,
                "price_delta": delta,
                "total_price": base_price + delta
            })
        return result
    def get_options_list(self):
            """將 options 字串轉換為列表"""
            return [opt.strip() for opt in self.options.split(',') if opt.strip()]
        
    def set_options_list(self, options_list):
        """將列表轉換為 options 字串"""
        self.options = ','.join(options_list)

    def __repr__(self):
        return f"<SizesOption(Product_id={self.id}, size='{self.size}', description='{self.description}')>"