# AI Context - Restaurant Management

Updated: 2026-04-12
Purpose: Provide a fast, reliable project brief for AI-assisted development in this repository.

## 1) Product Summary

This is a full-stack restaurant management system with two primary experiences:

- Admin portal for operations management (tables, menu, staff, customers, orders, analytics).
- Customer portal for browsing menu, booking tables, viewing orders/profile.

Current implementation is functional in several areas but still partially scaffolded. A number of pages are UI-rich and need backend integration hardening.

---

## 2) Tech Stack

### Monorepo Layout

- Root workspace: orchestrates frontend + backend concurrent start.
- Backend: Node.js + Express + MongoDB (Mongoose).
- Frontend: React + Vite + Tailwind + shadcn/ui + React Router.

### Root Scripts

- `npm run install-all`: installs root/backend/frontend dependencies.
- `npm start`: runs backend + frontend concurrently.

### Backend Stack

- Express 5
- Mongoose 9
- Multer for image upload
- CORS + dotenv
- Nodemon for development

### Frontend Stack

- React 19 + Vite 8
- React Router 7
- Axios API client
- React Hook Form + Zod
- Recharts for analytics
- Sonner for toast notifications
- shadcn/ui component set

---

## 3) Project Structure (Mental Model)

### Backend

- `src/server.js`: app bootstrap, middleware, route mounting, payload/file error handling.
- `src/configs/database.js`: DB connect helper.
- `src/models/*`: domain models (table, menu, staff, customer, order).
- `src/controllers/admin/*`: admin business logic.
- `src/routes/admin/*`: admin route definitions + index aggregator.
- `src/middlewares/upload.middleware.js`: menu image upload pipeline.
- `uploads/menus`: static image storage served via `/uploads`.

### Frontend

- `src/app/App.jsx`: route tree for `/admin` and `/customer`.
- `src/layouts/*`: admin/customer layout wrappers.
- `src/features/*`: feature modules (admin + customer domains).
- `src/shared/components/ui/*`: reusable UI primitives.
- `src/shared/components/layout/*`: reusable layout components.
- `src/services/api/client.js`: shared API client.
- `src/shared/utils/index.js`: shared utilities.
- `src/shared/styles/index.css`: global styles.

---

## 4) Domain Model Snapshot

### Table

- Fields: `tableNumber`, `area`, `capacity`, `status`.
- `status` enum: `available | occupied | reserved | cleaning`.

### Menu

- Fields: `name`, `price`, `categoryId`, `available`, `soldCount`, `imageUrl`, `description`.

### Staff

- Fields: `fullName`, `email`, `phone`, `role`, `startDate`, `active`.
- `role` enum: `admin | waiter | kitchen`.

### Customer

- Fields include tier/points/visit metadata and recentOrders subdocs.

### Order

- Includes embedded customer snapshot + item lines + payment/status.
- Virtual `totalAmount` computed from item list.

Important inconsistency:

- Most backend files use ES modules, but `order.model.js` currently uses CommonJS (`require/module.exports`). This should be normalized.

---

## 5) Routing & API Surface (Current)

### Implemented Admin Route Prefixes

- `/admin/tables`
- `/admin/dashboard`
- `/admin/menus`
- `/admin/staffs`
- `/admin/customers`
- `/admin/orders`
- `/admin/statistics`

### Customer Route Layer

- `backend/src/routes/client` currently empty.
- `backend/src/controllers/client` currently empty.
- Customer frontend pages exist, but backend client API layer is not yet implemented.

---

## 6) Feature Status (Reality Check)

### Working or Partially Working

- Table management has CRUD endpoints and frontend integration.
- Menu list/create and image upload path exist.
- Orders list endpoint exists; invoice UI is relatively advanced.

### Stub/Incomplete Backend Areas

- `dashboard.controller.js` returns placeholder data.
- `statistic.controller.js` returns empty array.
- `staff.controller.js` currently only includes list operation.
- Customer CRUD backend is incomplete.

### Frontend Integration Gaps

- Analytics page currently based on mock dataset.
- Customer booking page currently uses in-memory table data.
- Some pages mix local state mutation and API state.

Known bug pattern to fix early:

- Table page effect dependency currently triggers fetch on `tables` changes, causing repeated network fetch loops.

Quality note:

- Frontend build succeeds, but lint still reports code-quality issues (unused variables, effect patterns, and config lint exceptions).

---

## 7) Operational Constraints & Conventions

### Config/Payload Constraints

- Backend JSON/urlencoded payload limit: `10mb`.
- Image upload limit: `5MB`.
- Only image MIME types are accepted for menu uploads.
- Upload path is static served from `/uploads`.

### Language Conventions

- User-facing messages/UI: Vietnamese.
- Code comments/log context: typically English (with occasional Vietnamese present).

### Coding Conventions (See docs/RULES.md)

- ES module imports/exports expected across codebase.
- Backend organized by model/controller/route/middleware.
- Frontend patterns favor React Hook Form + Zod and shadcn components.
- Error handling should be explicit and user-friendly.

---

## 8) Priority Direction for AI Contributions

When asked to implement features, prioritize in this order:

1. Standardize environment/config and API response contracts.
2. Complete missing critical admin backend CRUD/aggregations (staff, dashboard, statistics).
3. Create customer backend route/controller layer.
4. Replace frontend mock data with real API integration.
5. Add authentication/authorization and test foundation.

Backlog source of truth is `docs/tasks.md`.

---

## 9) AI Working Guidelines for This Repo

When generating code:

- Preserve existing architecture (admin/client route split, page/layout organization).
- Prefer incremental changes over broad refactors.
- Keep response/error shapes consistent once standardized.
- Ensure frontend changes include loading/empty/error states.
- Avoid introducing new patterns if existing conventions already cover the need.

Structure expectation for new frontend code:

- Put route-level files under `src/features/<feature>/pages`.
- Put feature-specific components close to their feature.
- Put reusable primitives under `src/shared/components/ui`.
- Use `src/services/api/client.js` for API access.

Before finishing major tasks:

- Verify route wiring end-to-end (route -> controller -> model).
- Validate API and UI contract compatibility.
- Check for accidental debug logs.
- Confirm no mock data remains in features being marked complete.
