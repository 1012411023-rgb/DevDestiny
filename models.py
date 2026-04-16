from extensions import db
from datetime import datetime


class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    make = db.Column(db.String(50))
    model = db.Column(db.String(50))
    license_plate = db.Column(db.String(20), unique=True)
    vehicle_type = db.Column(db.String(50), default='two-wheeler')

class Ride(db.Model):
    __tablename__ = 'rides'
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    origin = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), default='active')
    price_per_seat = db.Column(db.Numeric(10, 2), default=0.00)
    current_lat = db.Column(db.Float, nullable=True)
    current_lon = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RideRequest(db.Model):
    __tablename__ = 'ride_requests'
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.id'), nullable=False)
    passenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    seats_requested = db.Column(db.Integer, default=1)
    status = db.Column(db.String(50), default='pending')
    payment_status = db.Column(db.String(50), default='unpaid')
    payment_method = db.Column(db.String(50), default='not_set')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('ride_requests.id'), nullable=False)
    stripe_payment_intent_id = db.Column(db.String(255))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
