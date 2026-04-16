from flask import Blueprint, jsonify

rides_bp = Blueprint('rides_bp', __name__)

@rides_bp.route('/', methods=['GET'])
def get_rides():
    return jsonify({
        'status': 'success',
        'message': 'Ride endpoint is available',
        'rides': [],
    }), 200
