from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Enum
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
    created_at = Column(DateTime, default=datetime.utcnow)

    payments = relationship("PaymentHistory", foreign_keys="[PaymentHistory.company_id]", back_populates="company")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    reference_images_count = Column(Integer)
    model_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    model_id = Column(Integer, ForeignKey("models.id"))
    image_path = Column(String)
    anomaly_score = Column(Float)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    heatmap_path = Column(String)
    confidence_score = Column(Float)

class Defect(Base):
    __tablename__ = "defects"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    defect_type = Column(String)
    severity = Column(String)
    description = Column(String)

class BillingLog(Base):
    __tablename__ = "billing_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("companies.id"))
    inspections_count = Column(Integer)
    amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("companies.id"))
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class PaymentHistory(Base):
    __tablename__ = "payment_history"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("companies.id"))
    amount = Column(Float)
    plan_type = Column(String)
    payment_status = Column(String)
    payment_method = Column(String)
    transaction_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", foreign_keys=[company_id], back_populates="payments")