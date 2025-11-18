from config import db

class Sugar_Option(db.Model):
    __tablename__ = 'sugar_options'

    product_id = db.Column(db.Integer, db.ForeignKey('store.products.id') ,primary_key=True)
    options = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"<SugarOption(Product_id={self.id}, size='{self.size}', description='{self.description}')>"