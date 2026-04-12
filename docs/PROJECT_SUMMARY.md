# Project Summary

## 1. Description

Restaurant Management System is a full-stack web application for restaurant operations and customer interactions.

- Admin side: tables, menu, staff, customers, orders/invoices, reports.
- Customer side: browse menu, book tables, view profile and order history.

## 2. Scope

- Target: small to medium restaurants.
- Focus: internal operations + customer self-service UX.
- Out of scope today: multi-branch management, advanced enterprise access control.

## 3. Business Rules

- Menu price must be positive.
- One order has one payment method (`cash`, `card`, `transfer`).
- Table statuses must remain within allowed enum values.
- Customer and staff records should be validated before persistence.

## 4. Feature Coverage (Current)

### Admin

- Table Management: API-backed CRUD implemented.
- Menu Management: list/create implemented; update/delete pending on backend.
- Staff Management: list API exists; create/update/delete still pending on backend.
- Customer Management: list API exists; action endpoints (reward/lock/update) pending.
- Orders/Invoices: list API exists; mutation and export flow still partial.
- Dashboard/Analytics: frontend experience exists; backend endpoints are still placeholders.

### Customer

- Customer pages and routing exist.
- Major customer pages are still mostly mock/local-state driven until client APIs are implemented.

### Platform

- Image upload pipeline (Multer) is implemented.
- Base error handling exists in backend.
- Authentication/authorization is not fully implemented yet.

## 5. Tech Stack

### Backend

- Node.js + Express 5
- MongoDB + Mongoose
- Multer, CORS, dotenv

### Frontend

- React 19 + Vite 8
- React Router 7
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Axios + Sonner + Recharts

## 6. Architecture

### Backend (MVC-style)

```
backend/src/
├── server.js
├── configs/
├── models/
├── controllers/admin/
├── routes/admin/
└── middlewares/
```

### Frontend (feature-first)

```
frontend/src/
├── app/                     # App shell + route tree
├── features/                # Domain features (admin + customer)
├── shared/                  # Shared components, hooks, utils, styles
├── services/                # API client and service layer
└── layouts/                 # Admin/customer layout wrappers
```

## 7. Data Flow

Frontend (`app` + `features`) -> service API client (`services/api/client.js`) -> Express routes/controllers -> MongoDB -> response to frontend state/UI.

## 8. Current Status

- Frontend refactor to feature-first structure completed.
- Build passes after refactor.
- Documentation in `docs/features/*` now maps to feature-first paths.
- Remaining major work: backend completion for dashboard/statistics/staff/customer actions and customer-facing API layer.
