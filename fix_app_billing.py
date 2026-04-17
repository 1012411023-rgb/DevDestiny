with open('backend/app.py', 'r') as f:
    content = f.read()

# Find the get_billing_history and save_transaction_api endpoints
old_code = """
@app.route("/api/billing/history", methods=["GET"])
def billing_history_api():
    return jsonify(get_billing_history())

@app.route("/api/billing/transaction", methods=["POST"])
def save_transaction_api():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    saved = save_to_billing_history(data)
    return jsonify({"status": "success", "transaction": saved})
"""

new_code = """
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
        
    history = get_billing_history()
    user_history = [item for item in history if str(item.get("user_id")) == user_id]
    return jsonify(user_history)

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
    
    data["user_id"] = user_id
    history = get_billing_history()
    data["date"] = datetime.now().isoformat()
    data["status"] = "success"
    data["id"] = f"tx_{len(history)+1}"
    history.insert(0, data)
    with open(BILLING_HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)
        
    return jsonify({"status": "success", "transaction": data})
"""

content = content.replace(old_code.strip(), new_code.strip())

with open('backend/app.py', 'w') as f:
    f.write(content)
