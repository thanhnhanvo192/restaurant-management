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

- Table Management: API-backed CRUD implemented with search, filters, and inline edits.
- Menu Management: list/create implemented; update/delete are still pending on the backend.
- Staff Management: list API exists; create/update/delete are still pending on the backend.
- Customer Management: list API exists; action endpoints (reward/lock/update) are still pending.
- Orders/Invoices: list API exists; mutation and export flow are still partial.
- Dashboard/Analytics: frontend experience exists; backend endpoints are still placeholders.

### Customer

- Customer route layer and auth flow now exist.
- Customer pages are wired to backend APIs for dashboard, tables, bookings, categories, menus, orders, profile, and addresses.
- Shared session helpers store access/refresh tokens and cached profile data for the customer shell.

### Platform

- Image upload pipeline (Multer) is implemented.
- Base error handling exists in backend.
- Customer authentication/session handling is implemented; admin authorization hardening is still pending.

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
├── controllers/client/
├── routes/admin/
├── routes/client/
├── routes/auth.route.js
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
- Customer-facing backend APIs are implemented and mounted through `/client/*` and `/auth`.
- Build currently reflects the feature-first app structure and the new customer session flow.
- Remaining major work: admin backend completion for dashboard/statistics/staff/customer actions, plus auth/authorization hardening.
