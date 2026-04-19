# Restaurant Management

## Setup

### 1. Configure the backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in the required variables:
   - `MONGO_URL`: MongoDB connection string for your local server or MongoDB Atlas.
   - `PORT`: backend port, default `5000`.
   - `CORS_ORIGIN`: allowed frontend origin(s), comma-separated.
   - `NODE_ENV`: `development`, `test`, or `production`.
3. Start a local MongoDB instance or use an Atlas connection string.

### 2. Configure the frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_BASE_URL` to the backend URL, for example `http://localhost:5000`.

### 3. Run the app

- Install dependencies: `npm run install-all`
- Start both apps: `npm start`
- Run tests: `npm run test`

## Notes

- Backend env validation now requires `MONGO_URL` at startup.
- If `MONGO_URL` is missing, the backend exits with a clear error message.
