# DevDestiny

DevDestiny is an AI-powered visual quality inspection SaaS platform. It combines a Flask backend API with a React/Vite frontend to detect manufacturing defects, visualize heatmaps, and generate inspection reports.

## Project Structure

- `app.py`: Flask backend entry point and SPA static file server.
- `frontend/`: React + Vite dashboard and file upload UI.
- `frontend/README.md`: Frontend-specific usage documentation.
- `requirements.txt`: Python dependency list.
- `.env.example`: Environment variable template.

## Prerequisites

- [Node.js](https://nodejs.org/) (for frontend dependencies and Vite)
- [Python 3.9+](https://www.python.org/)
- `pip`

## Environment Variables

Create a `.env` file in the repository root with required configuration.

```bash
GROK_API_KEY="your-grok-api-key-here"
DATABASE_URL="mysql+pymysql://root:root123@localhost/unipool"
```

Notes:
- `GROK_API_KEY` is used by the generative model that parses inspection heatmaps.
- `DATABASE_URL` is optional. The app defaults to `mysql+pymysql://root:root123@localhost/unipool`.
- If using PostgreSQL, set `DATABASE_URL` to a `postgresql://...` value.

## Setup & Run Instructions

### 1. Backend Setup

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The Flask backend starts on `http://127.0.0.1:5000` by default.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server typically runs at `http://127.0.0.1:5173`.

## Backend Endpoints

The Flask app registers these API blueprints:

- `GET /health` — health check
- `/api/auth/*` — auth routes
- `/api/rides/*` — rides and trip endpoints
- `/api/payments/*` — payment endpoints

The backend also serves the frontend SPA from the `frontend/` folder.

## Notes

- There is no separate `backend/` folder in this repository; the backend is served from `app.py`.
- For frontend-specific usage, see `frontend/README.md`.
