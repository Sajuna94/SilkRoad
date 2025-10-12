from flask import Blueprint
from flask import request, jsonify
from config.database import db

test_routes = Blueprint('test', __name__)

class Test(db.Model):
    #指定這個模型所對應的資料表名稱
    __tablename__ = 'tests'

    #定義columns
    id = db.Column(db.Integer, primary_key=True)
    data1 = db.Column(db.String(80), nullable = False)
    data2 = db.Column(db.String(80), nullable = False)


@test_routes.route('/list', methods=['GET'])
def list_users():
    tests = Test.query.all()
    return jsonify([{'data1': test.data1, 'data2': test.data2} for test in tests])

@test_routes.route('/add', methods=['POST'])
def add_user():
    data = request.get_json()
    if not data or not data.get('data1') or not data.get('data2'):
        return jsonify({'message': '缺少必要的欄位'}), 400
    new_test = Test(data1=data['data1'], data2=data['data2'])
    db.session.add(new_test)
    db.session.commit()
    return jsonify({'message': '新增成功', 'id': new_test.id}), 201
