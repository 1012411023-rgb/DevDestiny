from flask import Flask, jsonify, request, send_from_directory, send_file
import sys
import os
from dotenv import load_dotenv

# Load local .env file if it exists
load_dotenv()

# Add backend directory to sys.path so Vercel can find modules correctly
sys.path.append(os.path.dirname(__file__))

from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime
import razorpay

from extensions import db

# Point Flask to serve frontend static files
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Razorpay Client (Test Mode)
RAZORPAY_KEY_ID = "rzp_test_SNzoYnfncgbjxu"
RAZORPAY_KEY_SECRET = "x2QSoLliduNGiCyS1E1mppu6"
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Database connection (Vercel/Heroku usually provide 'postgres://', SQLAlchemy needs 'postgresql://')
db_url = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:root123@localhost/unipool')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register Blueprints
with app.app_context():
    from routes_auth import auth_bp
    from routes_rides import rides_bp
    from routes_payments import payments_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(rides_bp, url_prefix='/api/rides')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve frontend static files. Falls back to index.html for SPA routing."""
    full_path = os.path.join(FRONTEND_DIR, path)
    if path and os.path.exists(full_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

application = app
