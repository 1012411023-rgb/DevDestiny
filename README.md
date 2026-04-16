

## Project Structure

The project is structured into two main applications:

- \`frontend/\`: React and Vite app containing the dashboard, historic visualization, and file-upload forms.
- \`backend/\`: Flask powered API running our Python inference and model calibration endpoints.

## Prerequisites

- [Node.js](https://nodejs.org/) (for Vite / React)
- [Python 3.9+](https://www.python.org/) 

## Environment Variables

You must supply APIs key for generative models parsing.
Create a \`.env\` file in the root or \`backend/\` directory.

```bash
# Needed for the AI to parse the visual heatmap.
GROK_API_KEY="your-grok-api-key-here"
```

## Setup & Run Instructions

### 1. Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Unix/Mac
# venv\\Scripts\\activate   # On Windows

# Install dependencies
pip install -r requirements.txt

# Start the Flask API
python app.py
```

### 2. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend

# Install Node modules
npm install

# Start the React / Vite server
npm run dev
```

### 3. Testing the Inference Logic

You can test that the model hooks load properly natively via python. This proves the \`torchvision.models.resnet50\` initializes seamlessly.

```bash
cd backend
python test_model.py
```

## API Routes

### \`POST /api/products/<product_id>/calibrate\` 
Upload 10-20 "good" quality reference images of a product category. The backend extracts model features, calculates means & covariances and outputs a lightweight pickled statistical representation.

### \`POST /api/products/<product_id>/inspect\`
Upload a single target image for defect querying against the compiled model. Calculates the bounding map anomaly score returning a rendered raw base64 string heat-map locally.

### \`POST /api/products/<product_id>/report\`
Ingests the heatmap metric mapping against the generative model layer to output categorical diagnostic fixes. 
