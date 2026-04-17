import os
import json
import uuid
from datetime import datetime
import jwt
from database.db import get_db, engine
from sqlalchemy.orm import Session
from database import crud, schemas, models

models.Base.metadata.create_all(bind=engine)
from flask import Flask, request, redirect, url_for, render_template, flash, jsonify, send_file
from fpdf import FPDF
from flask_cors import CORS
from ai.calibrate import calibrate
from ai.inference import run_inference
from dotenv import load_dotenv
import razorpay

load_dotenv()

UPLOAD_FOLDER = "uploads"
DATA_FOLDER = "data"
STATS_FILE = os.path.join(DATA_FOLDER, "stats.json")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.secret_key = "supersecretkey"
app.config["JWT_SECRET"] = "your-secret-key"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


@app.route("/favicon.ico")
def favicon():
    return "", 204


def get_stats():
    if not os.path.exists(STATS_FILE):
        return {}
    try:
        with open(STATS_FILE, "r") as f:
            return json.load(f)
    except:
        return {}


def save_stats(stats):
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BILLING_HISTORY_FILE = os.path.join(BASE_DIR, "billing_history.json")
USERS_FILE = os.path.join(BASE_DIR, "users.json")
TEMPLATES_FILE = os.path.join(BASE_DIR, "templates.json")
INSPECTIONS_FILE = os.path.join(BASE_DIR, "inspections.json")


def load_json(filename, default=[]):
    if not os.path.exists(filename):
        return default
    with open(filename, "r") as f:
        try:
            return json.load(f)
        except:
            return default


def save_json(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)


def get_billing_history():
    return load_json(BILLING_HISTORY_FILE)


def save_to_billing_history(transaction):
    history = get_billing_history()
    transaction["date"] = datetime.now().isoformat()
    transaction["status"] = "success"
    history.insert(0, transaction)
    save_json(BILLING_HISTORY_FILE, history)
    return transaction


CATEGORIES = [
    {
        "id": "textile",
        "name": "Textile / Fabric",
        "shortDescription": "Woven materials including denim, silk, and synthetic blends.",
        "commonDefects": [
            "Thread pull",
            "Weave anomaly",
            "Stain detection",
            "Color drift",
        ],
    },
    {
        "id": "ceramic",
        "name": "Ceramic Tile",
        "shortDescription": "Surface inspection for glaze uniformity and structural integrity.",
        "commonDefects": ["Glaze crack", "Kiln spot", "Edge chip", "Dimension error"],
    },
    {
        "id": "metal",
        "name": "Metal Surface",
        "shortDescription": "Industrial metal sheets, casings, and high-precision components.",
        "commonDefects": [
            "Scratch detection",
            "Dent identification",
            "Rust spotting",
            "Warping",
        ],
    },
]


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify(CATEGORIES)


@app.route("/api/products", methods=["GET"])
def get_products():
    models_dir = "models"
    if not os.path.exists(models_dir):
        return jsonify({"products": []})

    products = [f[:-4] for f in os.listdir(models_dir) if f.endswith(".pkl")]
    return jsonify({"products": products})


@app.route("/api/upload", methods=["POST"])
def upload_file():
    category = request.form.get("category")
    files = request.files.getlist("files")

    if not category:
        return jsonify({"error": "No category provided"}), 400
    if not files:
        return jsonify({"error": "No files provided"}), 400

    uploaded_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = f"{category}_{file.filename}"
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)
            uploaded_files.append(filename)

    import random

    # Placeholder logic for CV model integration
    # When CV is ready, process the uploaded_files here
    is_fail = random.choice([True, False])
    anomaly_score = (
        round(random.uniform(60, 100), 2)
        if is_fail
        else round(random.uniform(1, 20), 2)
    )
    severity = random.choice(["High", "Medium"]) if is_fail else "Low"
    likely_issue = (
        "Surface Discontinuity / Material Anomaly" if is_fail else "None detected"
    )

    return jsonify(
        {
            "message": f"Successfully processed {len(uploaded_files)} files for category {category}",
            "files": uploaded_files,
            "inference": {
                "status": "fail" if is_fail else "pass",
                "anomalyScore": anomaly_score,
                "severity": severity,
                "likelyIssue": likely_issue,
            },
        }
    )


CALIBRATION_PROGRESS_STORE = {}


@app.route("/api/products/<product_id>/calibrate", methods=["POST"])
def calibrate_api(product_id):
    files = request.files.getlist("files")
    if not files:
        return jsonify({"status": "error", "message": "No files uploaded"}), 400

    product_dir = os.path.join(app.config["UPLOAD_FOLDER"], product_id)
    os.makedirs(product_dir, exist_ok=True)

    for f in files:
        if f and allowed_file(f.filename):
            f.save(os.path.join(product_dir, f.filename))

    CALIBRATION_PROGRESS_STORE[product_id] = {
        "status": "running",
        "progress": 0,
        "message": "Starting calibration...",
    }

    def update_progress(prog, msg):
        CALIBRATION_PROGRESS_STORE[product_id] = {
            "status": "running",
            "progress": prog,
            "message": msg,
        }

    try:
        import glob

        image_paths = glob.glob(os.path.join(product_dir, "*"))
        image_paths = [
            p for p in image_paths if p.lower().endswith((".png", ".jpg", ".jpeg"))
        ]
        output_path = os.path.join("models", f"{product_id}.pkl")
        update_progress(50, "Calibrating model...")
        calibrate(image_paths=image_paths, output_path=output_path)
        CALIBRATION_PROGRESS_STORE[product_id] = {
            "status": "complete",
            "progress": 100,
            "message": "Calibration complete!",
        }
        return jsonify({"status": "success", "product_id": product_id})
    except Exception as e:
        import traceback

        traceback.print_exc()
        CALIBRATION_PROGRESS_STORE[product_id] = {
            "status": "error",
            "progress": 0,
            "message": f"Error: {str(e)}",
        }
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/products/<product_id>/calibration-status", methods=["GET"])
def get_calibration_status(product_id):
    state = CALIBRATION_PROGRESS_STORE.get(
        product_id,
        {"status": "unknown", "progress": 0, "message": "No active calibration."},
    )
    return jsonify(state)


@app.route("/api/products/<product_id>/stats", methods=["GET"])
def get_product_stats(product_id):
    stats = get_stats()
    product_stats = stats.get(
        product_id, {"total_scanned": 0, "total_approved": 0, "total_defective": 0}
    )
    return jsonify(product_stats)


@app.route("/api/products/<product_id>/inspect", methods=["POST"])
def inspect_api(product_id):
    is_live = request.form.get("live", "false").lower() == "true"
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No image provided"}), 400

    file = request.files["file"]
    if not file or not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Invalid file format"}), 400

    temp_path = os.path.join(app.config["UPLOAD_FOLDER"], f"temp_{file.filename}")
    file.save(temp_path)

    try:
        model_path = os.path.join("models", f"{product_id}.pkl")
        raw_result = run_inference(image_path=temp_path, model_path=model_path)

        is_pass = raw_result["status"] == "PASS"

        import cv2
        import base64

        inspection_id = f"INS-{__import__('random').randint(1000, 9999)}"
        os.makedirs("static/heatmaps", exist_ok=True)
        cv2.imwrite(f"static/heatmaps/{inspection_id}.jpg", raw_result["overlay"])

        _, buffer = cv2.imencode(".jpg", raw_result["overlay"])
        heatmap_base64 = base64.b64encode(buffer).decode("utf-8")

        result = {
            "pass": is_pass,
            "anomaly_score": raw_result["score"],
            "heatmap_base64": heatmap_base64,
            "heatmap_url": f"/static/heatmaps/{inspection_id}.jpg",
        }

        if not is_live:
            db = next(get_db())
            
            # Extract company_id from token
            token = request.headers.get("Authorization", "").replace("Bearer ", "")
            company_id = None
            if token:
                try:
                    token_data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
                    company_id = token_data["user_id"]
                except:
                    pass

            # Try to find the product/template in DB
            # If product_id is a string from URL, we might need to handle it
            # For now, assume it's an ID or name
            db_product = db.query(models.Product).filter(
                (models.Product.id == product_id) if product_id.isdigit() else (models.Product.name == product_id)
            ).first()
            
            # Default model accuracy
            model_accuracy = 98.4
            db_model_id = None
            if db_product and db_product.models:
                db_model_id = db_product.models[0].id
                model_accuracy = db_product.models[0].accuracy

            # Save to DB
            new_inspection = models.Inspection(
                company_id=company_id,
                product_id=db_product.id if db_product else None,
                model_id=db_model_id,
                image_path=temp_path,
                anomaly_score=round(float(result.get("anomaly_score", 0)), 2),
                status="pass" if result.get("pass", False) else "fail",
                severity="High" if not result.get("pass", False) else "Low",
                likely_issue="Surface Discontinuity / Material Anomaly" if not result.get("pass", False) else "Consistent Surface"
            )
            db.add(new_inspection)
            db.commit()
            db.refresh(new_inspection)

            result.update({
                "id": f"INS-{new_inspection.id}",
                "templateName": db_product.name if db_product else product_id,
                "category": db_product.category if db_product else "Detection",
                "modelAccuracy": model_accuracy,
                "likelyIssue": new_inspection.likely_issue,
                "severity": new_inspection.severity,
            })
        else:
            result.update({
                "id": inspection_id,
                "status": "pass" if result.get("pass", False) else "fail",
                "severity": "High" if not result.get("pass", False) else "Low",
                "likelyIssue": "Surface Discontinuity" if not result.get("pass", False) else "None",
                "anomalyScore": round(float(result.get("anomaly_score", 0)), 2),
            })

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/inspections/<inspection_id>/pass-override", methods=["POST"])
def pass_override(inspection_id):
    inspections = load_json(INSPECTIONS_FILE)
    inspection = next((i for i in inspections if i["id"] == inspection_id), None)

    if not inspection:
        return jsonify({"error": "Inspection not found"}), 404

    if inspection["status"] == "pass":
        return jsonify({"message": "Already approved", "inspection": inspection}), 200

    # 1. Update the inspection record
    inspection["status"] = "pass"
    inspection["likelyIssue"] = "Consistent Surface (Manual Override)"
    inspection["severity"] = "Low"
    save_json(INSPECTIONS_FILE, inspections)

    # 2. Update global stats for the product
    product_id = inspection.get("templateName")
    if product_id:
        stats = get_stats()
        if product_id in stats:
            stats[product_id]["total_approved"] += 1
            stats[product_id]["total_defective"] -= 1
            save_stats(stats)

    return jsonify({"status": "success", "inspection": inspection})


# --- AUTH ROUTES ---


@app.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    data = request.json
    db = next(get_db())
    company = crud.get_company_by_email(db, data["email"])
    if company:
        return jsonify({"error": "User already exists"}), 400

    company_data = schemas.CompanyCreate(
        name=data.get("name", "New User"),
        email=data["email"],
        password=data["password"],
        company_size=data.get("company_size", ""),
        product_types=data.get("product_types", ""),
    )
    new_comp = crud.create_company(db, company_data)
    
    # Create initial free subscription
    db_sub = models.Subscription(
        company_id=new_comp.id,
        plan="Free",
        start_date=datetime.utcnow(),
        is_active=True
    )
    db.add(db_sub)
    db.commit()

    token = jwt.encode(
        {"user_id": new_comp.id, "email": new_comp.email}, app.config["JWT_SECRET"], algorithm="HS256"
    )
    return jsonify({"id": new_comp.id, "email": new_comp.email, "token": token})


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json
    db = next(get_db())
    user = crud.get_company_by_email(db, data.get("email"))
    if not user or not crud.verify_password(data.get("password"), user.hashed_password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": user.id, "email": user.email}, app.config["JWT_SECRET"], algorithm="HS256"
    )
    return jsonify({"id": user.id, "email": user.email, "name": user.name, "token": token})


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token"}), 401
    try:
        data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
        db = next(get_db())
        user = db.query(models.Company).filter(models.Company.id == data["user_id"]).first()
        if not user:
            return jsonify({"error": "User not found"}), 401
        return jsonify({"id": user.id, "email": user.email, "name": user.name})
    except Exception as e:
        return jsonify({"error": str(e)}), 401


# --- TEMPLATE ROUTES ---


@app.route("/api/templates", methods=["GET"])
def get_templates():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    company_id = None
    if token:
        try:
            token_data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
            company_id = token_data["user_id"]
        except:
            pass
    
    db = next(get_db())
    query = db.query(models.Product)
    if company_id:
        query = query.filter(models.Product.company_id == company_id)
    
    products = query.all()
    templates = []
    for p in products:
        templates.append({
            "id": str(p.id),
            "name": p.name,
            "category": p.category,
            "status": p.status,
            "referenceImageCount": p.models[0].reference_images_count if p.models else 0,
            "updatedAt": p.created_at.isoformat()
        })
    return jsonify(templates)


@app.route("/api/templates", methods=["POST"])
def create_template():
    data = request.json
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    company_id = None
    if token:
        try:
            token_data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
            company_id = token_data["user_id"]
        except:
            pass

    db = next(get_db())
    new_product = models.Product(
        name=data["name"],
        category=data["category"],
        status="draft",
        company_id=company_id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return jsonify({
        "id": str(new_product.id),
        "name": new_product.name,
        "category": new_product.category,
        "status": new_product.status,
        "updatedAt": new_product.created_at.isoformat()
    })


@app.route("/api/stats/dashboard", methods=["GET"])
def get_dashboard_stats_api():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token"}), 401
    try:
        data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
        company_id = data["user_id"]
        db = next(get_db())
        stats = crud.get_dashboard_stats(db, company_id)
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/api/stats/passfail", methods=["GET"])
def get_pie_chart_stats():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        company_id = None # Fallback or handle error
    else:
        try:
            data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
            company_id = data["user_id"]
        except:
            company_id = None

    db = next(get_db())
    query = db.query(models.Inspection)
    if company_id:
        query = query.filter(models.Inspection.company_id == company_id)
    
    passed = query.filter(models.Inspection.status == "pass").count()
    failed = query.filter(models.Inspection.status == "fail").count()
    return jsonify({"passed": passed, "failed": failed})


@app.route("/api/inspections", methods=["GET"])
def get_inspections():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    company_id = None
    if token:
        try:
            token_data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
            company_id = token_data["user_id"]
        except:
            pass
    
    db = next(get_db())
    query = db.query(models.Inspection)
    if company_id:
        query = query.filter(models.Inspection.company_id == company_id)
    
    inspections = query.order_by(models.Inspection.created_at.desc()).all()
    results = []
    for i in inspections:
        results.append({
            "id": f"INS-{i.id}",
            "templateName": i.product.name if i.product else "Unknown",
            "category": i.product.category if i.product else "Detection",
            "timestamp": i.created_at.isoformat(),
            "status": i.status,
            "anomalyScore": i.anomaly_score,
            "severity": i.severity,
            "likelyIssue": i.likely_issue
        })
    return jsonify(results)


@app.route("/api/billing/history", methods=["GET"])
def billing_history_api():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token"}), 401
    try:
        data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
        user_id = str(data["user_id"])
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401

    db = next(get_db())
    history = db.query(models.PaymentHistory).filter(models.PaymentHistory.company_id == user_id).all()
    results = []
    for h in history:
        results.append({
            "id": h.id,
            "razorpay_payment_id": h.transaction_id,
            "date": h.created_at.isoformat(),
            "amount": h.amount,
            "status": h.payment_status,
            "plan": h.plan_type
        })
    return jsonify(results)


@app.route("/api/billing/create-order", methods=["POST"])
def create_order_api():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token"}), 401
    try:
        jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
    except:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json
    amount = data.get("amount", 5000) * 100  # Convert to paise
    currency = data.get("currency", "INR")

    order_params = {
        'amount': amount,
        'currency': currency,
        'payment_capture': 1
    }

    try:
        order = razorpay_client.order.create(data=order_params)
        return jsonify(order)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/billing/transaction", methods=["POST"])
def save_transaction_api():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token"}), 401
    try:
        token_data = jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
        user_id = str(token_data["user_id"])
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401

    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400

    # Signature verification
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_signature = data.get("razorpay_signature")

    if razorpay_signature:
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            razorpay_client.utility.verify_payment_signature(params_dict)
        except Exception as e:
            return jsonify({"status": "error", "message": "Payment verification failed"}), 400

    data["user_id"] = user_id
    
    db = next(get_db())
    new_payment = models.PaymentHistory(
        company_id=int(user_id),
        amount=data.get("amount", 5000),
        plan_type=data.get("plan", "premium"),
        payment_status="success",
        transaction_id=razorpay_payment_id
    )
    db.add(new_payment)
    
    # Update company subscription tier
    company = db.query(models.Company).filter(models.Company.id == int(user_id)).first()
    if company:
        company.subscription_tier = data.get("plan", "premium").capitalize()
        
        # Update or create active subscription
        active_sub = db.query(models.Subscription).filter(
            models.Subscription.company_id == company.id,
            models.Subscription.is_active == True
        ).first()
        if active_sub:
            active_sub.plan = company.subscription_tier
        else:
            new_sub = models.Subscription(
                company_id=company.id,
                plan=company.subscription_tier,
                start_date=datetime.utcnow(),
                is_active=True
            )
            db.add(new_sub)
            
    db.commit()

    return jsonify({"status": "success", "transaction": data})


@app.route("/api/inspections/<inspection_id>/report", methods=["GET"])
def download_report(inspection_id):
    inspections = load_json(INSPECTIONS_FILE)
    inspection = next((i for i in inspections if i["id"] == inspection_id), None)

    if not inspection:
        return jsonify({"error": "Inspection not found"}), 404

    # Generate PDF
    pdf = FPDF()
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(37, 99, 235)  # Blue color
    pdf.cell(0, 20, "DevDestany Inspection Report", ln=True, align="C")
    pdf.ln(10)

    # Metadata
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(50, 10, "Scan ID:", ln=0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, inspection["id"], ln=1)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(50, 10, "Timestamp:", ln=0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, inspection["timestamp"], ln=1)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(50, 10, "Product Name:", ln=0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, inspection["templateName"], ln=1)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(50, 10, "Category:", ln=0)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 10, inspection.get("category", "N/A"), ln=1)

    pdf.ln(10)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(10)

    # Result Section
    status = inspection["status"].upper()
    pdf.set_font("Helvetica", "B", 16)
    if status == "PASS":
        pdf.set_text_color(22, 163, 74)  # Green
    else:
        pdf.set_text_color(220, 38, 38)  # Red
    pdf.cell(0, 10, f"RESULT: {status}", ln=True)

    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 12)
    pdf.ln(5)
    pdf.cell(50, 10, "Anomaly Score:", ln=0)
    pdf.cell(0, 10, f"{inspection['anomalyScore']}%", ln=1)

    pdf.cell(50, 10, "Severity:", ln=0)
    pdf.cell(0, 10, inspection["severity"], ln=1)

    pdf.cell(50, 10, "Model Accuracy:", ln=0)
    pdf.cell(0, 10, f"{inspection.get('modelAccuracy', 'N/A')}%", ln=1)

    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(50, 10, "Likely Issue:", ln=0)
    pdf.set_font("Helvetica", "I", 12)
    pdf.cell(0, 10, inspection["likelyIssue"], ln=1)

    # Heatmap Image
    heatmap_path = os.path.join("static", "heatmaps", f"{inspection_id}.jpg")
    if os.path.exists(heatmap_path):
        pdf.ln(10)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 10, "Inspection Visual Analysis (Heatmap):", ln=True)
        pdf.ln(5)
        # Resize image to fit page (width 180mm)
        pdf.image(heatmap_path, x=15, w=180)

    # Footer
    pdf.set_y(-30)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, "Generated by DevDestany AI Factory Inspection System", ln=True, align="C")

    # Output to buffer
    output_filename = f"report_{inspection_id}.pdf"
    pdf_path = os.path.join("static", output_filename)
    os.makedirs("static", exist_ok=True)
    pdf.output(pdf_path)

    return send_file(pdf_path, as_attachment=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5005)
