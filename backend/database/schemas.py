from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    email: str
    company_size: Optional[str] = None
    product_types: Optional[str] = None
    subscription_tier: Optional[str] = "Free"
    subscription_status: Optional[str] = "Active"

class CompanyCreate(CompanyBase):
    password: str

class Company(CompanyBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    category: str
    status: Optional[str] = "ready"

class ProductCreate(ProductBase):
    company_id: int

class Product(ProductBase):
    id: int
    company_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ModelBase(BaseModel):
    reference_images_count: int
    model_type: str
    accuracy: Optional[float] = 98.4

class ModelCreate(ModelBase):
    product_id: int

class Model(ModelBase):
    id: int
    product_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class InspectionBase(BaseModel):
    image_path: str
    anomaly_score: float
    status: str
    severity: Optional[str] = "Low"
    likely_issue: Optional[str] = None

class InspectionCreate(InspectionBase):
    company_id: int
    product_id: int
    model_id: int

class Inspection(InspectionBase):
    id: int
    company_id: int
    product_id: int
    model_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SubscriptionBase(BaseModel):
    plan: str
    is_active: bool = True

class SubscriptionCreate(SubscriptionBase):
    company_id: int
    end_date: Optional[datetime] = None

class Subscription(SubscriptionBase):
    id: int
    company_id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    class Config:
        from_attributes = True

class PaymentHistoryBase(BaseModel):
    amount: float
    plan_type: str
    payment_status: str
    transaction_id: str

class PaymentHistoryCreate(PaymentHistoryBase):
    company_id: int

class PaymentHistory(PaymentHistoryBase):
    id: int
    company_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_inspections: int
    inspections_last_24h: int
    avg_pass_rate: float
    pass_rate_improvement: float
    active_templates: int
    total_templates: int
    anomalies_tracked: int
    requires_review: int