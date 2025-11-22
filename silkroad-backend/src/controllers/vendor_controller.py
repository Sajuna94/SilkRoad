"""
    By hansome young boy Etho
"""
from flask import jsonify, request
from models import Vendor

def register_vendor():
    # Implement registration logic here
    return jsonify({"message": "Vendor registered successfully"}), 201

def login_vendor():
    # Implement login logic here
    return jsonify({"message": "Vendor logged in successfully"}), 200

def logout_vendor():
    # Implement logout logic here
    return jsonify({"message": "Vendor logged out successfully"}), 200
