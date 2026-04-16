from flask import Blueprint, jsonify

payments_bp = Blueprint('payments_bp', __name__)

@payments_bp.route('/', methods=['GET'])
def get_payments():
    return jsonify({
        'status': 'success',
        'message': 'Payments endpoint is available',
        'payments': [],
    }), 200
