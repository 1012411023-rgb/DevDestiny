# DevDestiny Frontend

This is the React + Vite frontend for the DevDestiny inspection platform. It provides the dashboard, file upload UI, and single-page application experience.

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually `http://127.0.0.1:5173`.

## Build for Production

```bash
cd frontend
npm run build
```

The production build output is written to `frontend/dist/`.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — build production assets
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint checks

## Notes

- The frontend is served by the Flask backend at the root level when deployed.
- For full project setup and backend details, see the root `README.md`.
