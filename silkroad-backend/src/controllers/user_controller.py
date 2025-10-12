from flask import request, jsonify
from models import User
from config import db
from werkzeug.security import generate_password_hash, check_password_hash


def register_user():
    return jsonify({"message": "call : 'register_user' WIP"}), 501

def login_user(): 
    return jsonify({"message": "call : 'login_user' WIP"}), 501


    
