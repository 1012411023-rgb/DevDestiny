import json
import os
from database.db import SessionLocal, engine
from database import models, crud, schemas

# Create tables
models.Base.metadata.create_all(bind=engine)

def sync_users():
    if not os.path.exists('users.json'):
        print("No users.json found")
        return
    
    with open('users.json', 'r') as f:
        users = json.load(f)
    
    db = SessionLocal()
    for user_data in users:
        email = user_data.get('email')
        existing = db.query(models.Company).filter(models.Company.email == email).first()
        if not existing:
            print(f"Syncing user: {email}")
            # We need to create a Company object
            # Note: models.Company fields are: id, name, email, hashed_password, company_size, product_types
            # we should hash the password if it's plain in JSON
            # In users.json, password is "12345"
            password = user_data.get('password', 'password')
            hashed = crud.pwd_context.hash(password)
            
            new_user = models.Company(
                name=user_data.get('name', 'User'),
                email=email,
                hashed_password=hashed,
                company_size=user_data.get('company', ''),
                product_types='Standard'
            )
            db.add(new_user)
            db.commit()
    db.close()

if __name__ == "__main__":
    sync_users()
