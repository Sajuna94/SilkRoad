from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import pymysql
import os
from dotenv import load_dotenv

pymysql.install_as_MySQLdb()

db = SQLAlchemy()


""" Initialize the database with the Flask app. 
You have to Create the Database first in your SQL server(or localhost)
and get the Database URL, then put it in your .env file as DATABASE_URL variable.
format: 
    DATA_BASE = mysql://<username>:<password>@<host>:<port>/<db_name>
NOTE: Do not push .env file to github"""

def init_db(app: Flask):
    load_dotenv()
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    with app.app_context():
        db.create_all()