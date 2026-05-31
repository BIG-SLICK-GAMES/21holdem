# Local Development

## Frontend

1. Copy `frontend/.env.local.example` to `frontend/.env`.
2. Install dependencies from `frontend/`.
3. Start the frontend with `.\scripts\start-frontend.ps1` from the repo root.

## Backend

1. Copy `backend/.env.local.example` to `backend/.env`.
2. Install dependencies from `backend/`.
3. Start MongoDB and Redis locally.
4. Start the backend with `.\scripts\start-backend.ps1` from the repo root.

Use `.\scripts\check-env.ps1` to confirm local env files exist. The script does not print secret values.
