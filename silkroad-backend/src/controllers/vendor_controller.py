"""
    By hansome young boy Etho
"""
from flask import jsonify, request
from models import Vendor

def register_vendor(user):
    # Implement registration logic here
    return jsonify({"message": "Vendor registered successfully"}), 201
