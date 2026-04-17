import re

with open("backend/app.py", "r") as f:
    app_code = f.read()

app_code = app_code.replace('from flask import Flask', 'from backend.database.db import get_db\nfrom sqlalchemy.orm import Session\nfrom backend.database import crud, schemas\nfrom flask import Flask')

app_code = re.sub(r'def auth_signup\(\):.*?return jsonify\(new_user\)', '''def auth_signup():
    data = request.json
    db = next(get_db())
    company = crud.get_company_by_email(db, data["email"])
    if company:
        return jsonify({"error": "User already exists"}), 400
    from .database import schemas
    company_data = schemas.CompanyCreate(
        name=data.get("name", "New User"),
        email=data["email"],
        password=data["password"],
        company_size=data.get("company_size", ""),
        product_types=data.get("product_types", "")
    )
    new_comp = crud.create_company(db, company_data)
    token = jwt.encode({"user_id": new_comp.id}, app.config["JWT_SECRET"], algorithm="HS256")
    return jsonify({"id": new_comp.id, "email": new_comp.email, "token": token})''', app_code, flags=re.DOTALL)

with open("backend/app.py", "w") as f:
    f.write(app_code)
