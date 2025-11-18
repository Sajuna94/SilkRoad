from config import db

class Sizes_Option(db.Model):
    __tablename__ = 'sizes_options'

    product_id = db.Column(db.Integer, db.ForeignKey('store.products.id') ,primary_key=True)
    options = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"<SizesOption(Product_id={self.id}, size='{self.size}', description='{self.description}')>"