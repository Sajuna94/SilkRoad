from config import db

class Sugar_Option(db.Model):
    __tablename__ = 'sugar_options'
    __table_args__ = {"schema" : "store"}

    product_id = db.Column(db.Integer, db.ForeignKey('store.products.id') ,primary_key=True)
    options = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # def get_options_list(self):
    #         """將 options 字串轉換為列表"""
    #         return [opt.strip() for opt in self.options.split(',') if opt.strip()]
        
    # def set_options_list(self, options_list):
    #     """將列表轉換為 options 字串"""
    #     self.options = ','.join(options_list)

    def __repr__(self):
        return f"<SugarOption(Product_id={self.id}, size='{self.size}', description='{self.description}')>"