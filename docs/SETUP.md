# Setup Guide

## Backend Environment

1. Copy `backend/.env.example` to `backend/.env`.
2. Set required variables:

- `MONGO_URL`: MongoDB connection string
- `PORT`: backend port (default 5000)
- `CORS_ORIGIN`: comma-separated allowed origins
- `NODE_ENV`: development/production
- `API_PAYLOAD_LIMIT`: express body payload size

## Frontend Environment

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set:

- `VITE_API_BASE_URL`: backend base URL (for example `http://localhost:5000`)

## Start Commands

- Install all dependencies: `npm run install-all`
- Start backend + frontend: `npm start`
