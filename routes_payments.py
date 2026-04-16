import stripe
from flask import Blueprint, request, jsonify
from extensions import db
from models import Transaction, RideRequest
import os

payments_bp = Blueprint('payments', __name__)
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_51...your_test_key...') # User needs to set this

@payments_bp.route('/create-payment-intent', methods=['POST'])
def create_payment():
    data = request.get_json()
    request_id = data.get('request_id')
    amount = data.get('amount') # In cents
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount),
            currency='usd',
            metadata={'request_id': request_id}
        )
        
        new_tx = Transaction(
            request_id=request_id,
            stripe_payment_intent_id=intent.id,
            amount=amount / 100.0,
            status='pending'
        )
        db.session.add(new_tx)
        db.session.commit()
        
        return jsonify({
            'clientSecret': intent.client_secret
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    # In a real app, verify signature
    payload = request.get_json()
    event = payload['type']
    
    if event == 'payment_intent.succeeded':
        intent_id = payload['data']['object']['id']
        tx = Transaction.query.filter_by(stripe_payment_intent_id=intent_id).first()
        if tx:
            tx.status = 'succeeded'
            req = RideRequest.query.get(tx.request_id)
            if req:
                req.payment_status = 'paid'
            db.session.commit()
            
    return jsonify({"status": "success"}), 200
