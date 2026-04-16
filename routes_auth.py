from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    return jsonify({
        'status': 'success',
        'message': 'Login endpoint is available',
        'payload': data,
    }), 200
