from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    email: str
    company_size: Optional[str] = None
    product_types: Optional[str] = None

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

class InspectionCreate(InspectionBase):
    product_id: int
    model_id: int

class Inspection(InspectionBase):
    id: int
    product_id: int
    model_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ResultBase(BaseModel):
    heatmap_path: str
    confidence_score: float

class ResultCreate(ResultBase):
    inspection_id: int

class Result(ResultBase):
    id: int
    inspection_id: int
    class Config:
        from_attributes = True

class DefectBase(BaseModel):
    defect_type: str
    severity: str
    description: Optional[str] = None

class DefectCreate(DefectBase):
    inspection_id: int

class Defect(DefectBase):
    id: int
    inspection_id: int
    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    action: str

class ActivityLogCreate(ActivityLogBase):
    company_id: int

class ActivityLog(ActivityLogBase):
    id: int
    company_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class PaymentHistoryBase(BaseModel):
    amount: float
    plan_type: str
    payment_status: str
    payment_method: str
    transaction_id: str

class PaymentHistoryCreate(PaymentHistoryBase):
    company_id: int

class PaymentHistory(PaymentHistoryBase):
    id: int
    company_id: int
    created_at: datetime
    class Config:
        from_attributes = True