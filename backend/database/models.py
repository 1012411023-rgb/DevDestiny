from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    company_size = Column(String)
    product_types = Column(String)
    subscription_tier = Column(String, default="Free") # Free, Pro, Enterprise
    subscription_status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="company")
    inspections = relationship("Inspection", back_populates="company")
    subscriptions = relationship("Subscription", back_populates="company")
    payments = relationship("PaymentHistory", back_populates="company")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    category = Column(String)
    status = Column(String, default="ready") # ready, draft
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="products")
    models = relationship("Model", back_populates="product")
    inspections = relationship("Inspection", back_populates="product")

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    reference_images_count = Column(Integer)
    model_type = Column(String)
    accuracy = Column(Float, default=98.4)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="models")
    inspections = relationship("Inspection", back_populates="model")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    model_id = Column(Integer, ForeignKey("models.id"))
    image_path = Column(String)
    anomaly_score = Column(Float)
    status = Column(String) # pass, fail
    severity = Column(String) # Low, Medium, High
    likely_issue = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="inspections")
    product = relationship("Product", back_populates="inspections")
    model = relationship("Model", back_populates="inspections")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    plan = Column(String) # Free, Pro, Enterprise
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)

    company = relationship("Company", back_populates="subscriptions")

class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    amount = Column(Float)
    plan_type = Column(String)
    payment_status = Column(String)
    transaction_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="payments")