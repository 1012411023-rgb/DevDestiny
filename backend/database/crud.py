from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
from datetime import datetime

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

def create_result(db: Session, result: schemas.ResultCreate):
    db_result = models.Result(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def log_activity(db: Session, activity: schemas.ActivityLogCreate):
    db_log = models.ActivityLog(**activity.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def create_payment(db: Session, payment: schemas.PaymentHistoryCreate):
    db_payment = models.PaymentHistory(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment