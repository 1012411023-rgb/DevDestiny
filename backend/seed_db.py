from database.db import SessionLocal, engine
from database import models, crud
from datetime import datetime, timedelta
import random

def seed():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create a test company
    hashed_password = crud.pwd_context.hash("password123")
    company = models.Company(
        name="DevDestany Enterprise",
        email="test@devdestany.com",
        hashed_password=hashed_password,
        company_size="50-100",
        product_types="Manufacturing",
        subscription_tier="Pro",
        subscription_status="Active"
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    
    # Create a subscription
    sub = models.Subscription(
        company_id=company.id,
        plan="Pro",
        start_date=datetime.utcnow() - timedelta(days=30),
        is_active=True
    )
    db.add(sub)
    
    # Create some products (Templates)
    categories = ["Textile", "Ceramic", "Metal"]
    products = []
    for i in range(23):
        product = models.Product(
            company_id=company.id,
            name=f"Template {i+1}",
            category=random.choice(categories),
            status="ready" if i < 3 else "draft"
        )
        db.add(product)
        products.append(product)
    db.commit()

    # Add models for the products
    for p in products:
        model = models.Model(
            product_id=p.id,
            reference_images_count=random.randint(10, 50),
            model_type="Default",
            accuracy=round(random.uniform(97, 99.9), 1)
        )
        db.add(model)
    db.commit()

    # Create 42 inspections
    for i in range(42):
        # 33 failures as requested (Anomalies Tracked: 33)
        # 9 passes (42 total - 33 fails)
        is_pass = i < 9 
        status = "pass" if is_pass else "fail"
        severity = "Low" if is_pass else random.choice(["Medium", "High"])
        
        # Random time within last 24h
        created_at = datetime.utcnow() - timedelta(hours=random.randint(0, 23))
        
        inspection = models.Inspection(
            company_id=company.id,
            product_id=random.choice(products).id,
            image_path=f"static/heatmaps/dummy_{i}.jpg",
            anomaly_score=round(random.uniform(70, 95), 2) if not is_pass else round(random.uniform(5, 15), 2),
            status=status,
            severity=severity,
            likely_issue="Surface Discontinuity / Material Anomaly" if not is_pass else "Consistent Surface",
            created_at=created_at
        )
        db.add(inspection)
    
    db.commit()
    print("Database seeded successfully with dynamic data!")
    print(f"Company Email: test@devdestany.com")
    print(f"Password: password123")
    db.close()

if __name__ == "__main__":
    seed()
