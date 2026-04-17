from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext
from . import models, schemas
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_company_by_email(db: Session, email: str):
    return db.query(models.Company).filter(models.Company.email == email).first()

def create_company(db: Session, company: schemas.CompanyCreate):
    hashed_password = pwd_context.hash(company.password)
    db_company = models.Company(
        name=company.name,
        email=company.email,
        hashed_password=hashed_password,
        company_size=company.company_size,
        product_types=company.product_types
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def create_model(db: Session, model: schemas.ModelCreate):
    db_model = models.Model(**model.dict())
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def create_inspection(db: Session, inspection: schemas.InspectionCreate):
    db_inspection = models.Inspection(**inspection.dict())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

def get_dashboard_stats(db: Session, company_id: int):
    # Total Inspections
    total_inspections = db.query(models.Inspection).filter(models.Inspection.company_id == company_id).count()
    
    # Inspections last 24h
    day_ago = datetime.utcnow() - timedelta(days=1)
    inspections_last_24h = db.query(models.Inspection).filter(
        models.Inspection.company_id == company_id,
        models.Inspection.created_at >= day_ago
    ).count()
    
    # Avg Pass Rate
    passed = db.query(models.Inspection).filter(
        models.Inspection.company_id == company_id,
        models.Inspection.status == "pass"
    ).count()
    avg_pass_rate = (passed / total_inspections * 100) if total_inspections > 0 else 0
    
    # Active Templates
    active_templates = db.query(models.Product).filter(
        models.Product.company_id == company_id,
        models.Product.status == "ready"
    ).count()
    
    total_templates = db.query(models.Product).filter(models.Product.company_id == company_id).count()
    
    # Anomalies Tracked (Fails)
    anomalies_tracked = db.query(models.Inspection).filter(
        models.Inspection.company_id == company_id,
        models.Inspection.status == "fail"
    ).count()
    
    requires_review = db.query(models.Inspection).filter(
        models.Inspection.company_id == company_id,
        models.Inspection.status == "fail",
        models.Inspection.severity == "High"
    ).count()
    
    return {
        "total_inspections": total_inspections,
        "inspections_last_24h": inspections_last_24h,
        "avg_pass_rate": round(avg_pass_rate, 1),
        "pass_rate_improvement": 2.4, # Mocked for now, usually calculated vs previous period
        "active_templates": active_templates,
        "total_templates": total_templates,
        "anomalies_tracked": anomalies_tracked,
        "requires_review": requires_review
    }

def create_subscription(db: Session, subscription: schemas.SubscriptionCreate):
    db_sub = models.Subscription(**subscription.dict())
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub