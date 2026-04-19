# Restaurant Management Backlog

Updated: 2026-04-19
Scope: Full-stack backlog for admin + customer modules, based on current codebase status.

## Backlog System

Status legend:

- `TODO`: Not started
- `IN_PROGRESS`: Being implemented
- `BLOCKED`: Waiting for dependency/decision
- `DONE`: Completed and verified

Priority legend:

- `P0`: Critical for core product operation
- `P1`: Important for release quality
- `P2`: Nice-to-have / optimization

Definition of Done (DoD) for every task:

- Backend endpoint exists with validation and error handling.
- Frontend is wired to real API (no mock-only path for that feature).
- Empty/loading/error UI states are handled.
- Manual test checklist for the task passes.

---

## Snapshot Analysis (Current State)

- Admin route skeleton exists and is wired in Express.
- Several backend controllers are partial/stub (notably dashboard/statistics/staff CRUD).
- Customer backend layer is implemented (`backend/src/routes/client`, `backend/src/controllers/client`, and `backend/src/routes/auth.route.js`).
- Multiple frontend pages are now wired to real customer APIs, while several admin views still rely on partial backend support.
- Customer auth/session handling is present; admin authorization hardening is still pending.
- Baseline Jest test suites are established for backend and frontend.

---

## Epic A: Platform Foundation & Quality Gates

### A1. Environment Configuration Standardization

- ID: `A1`
- Priority: `P0`
- Status: `DONE`
- Description: Move hardcoded config (API base URL, allowed CORS origin) to environment variables for frontend and backend.
- Note: Completed full CRUD for /admin/staffs with validation and unique email handling
- Note: Fixed dotenv load order so backend reads `MONGO_URL` from `.env` before validation.
- Acceptance criteria:
  - Frontend reads API URL from Vite env variable.
  - Backend CORS origin and port configurable via `.env`.
  - README includes env setup steps.

### A2. Global Error/Response Contract

- ID: `A2`
- Priority: `P0`
- Status: `DONE`
- Description: Standardize API response envelopes and error format across all controllers.
- Acceptance criteria:
  - Every endpoint returns consistent shape for success and error.
  - Validation errors return 400 with field-level message where relevant.
  - Unhandled server errors return safe generic response.

### A3. Logging & Debug Cleanup

- ID: `A3`
- Priority: `P1`
- Status: `DONE`
- Description: Remove development debug logs and add intentional structured logging points.
- Acceptance criteria:
  - No accidental `console.log` in production paths.
  - Key actions (create/update/delete) have contextual logs.

### A4. Test Foundation

- ID: `A4`
- Priority: `P1`
- Status: `DONE`
- Description: Introduce baseline backend API tests and frontend component smoke tests.
- Note: Added baseline tests for table/menu/order/staff/customer (backend + frontend).
- Acceptance criteria:
  - At least one test per core resource (table/menu/order/staff/customer).
  - CI command for test execution documented.

---

## Epic B: Admin Backend Completion

### B1. Dashboard Controller Real Data

- ID: `B1`
- Priority: `P0`
- Status: `DONE`
- Description: Replace placeholder dashboard response with aggregated metrics from orders, customers, tables, menus.
- Note: Implemented real dashboard aggregations with totals and daily/weekly trends plus valid zero-state payload.
- Dependencies: `A2`
- Acceptance criteria:
  - Endpoint returns totals and recent trends (daily/weekly).
  - Empty database returns valid zero-state payload.

### B2. Statistics Controller Real Aggregations

- ID: `B2`
- Priority: `P0`
- Status: `DONE`
- Description: Implement statistics endpoint with filterable period and category/staff breakdown.
- Note: Implemented `/admin/statistics` with `period/from/to` filtering, chart-ready summary + breakdown payload, and zero-state defaults.
- Dependencies: `A2`, `B1`
- Acceptance criteria:
  - Supports date-range query params.
  - Returns chart-ready structure for frontend analytics page.

### B3. Staff CRUD API Completion

- ID: `B3`
- Priority: `P0`
- Status: `TODO`
- Description: Complete create/update/delete staff endpoints and validations.
- Dependencies: `A2`
- Acceptance criteria:
  - Full CRUD routes for `/admin/staffs`.
  - Unique email handling and friendly conflict message.

### B4. Customer CRUD API Completion

- ID: `B4`
- Priority: `P1`
- Status: `DONE`
- Description: Complete missing customer operations beyond list retrieval.
- Dependencies: `A2`
- Acceptance criteria:
  - CRUD routes aligned with frontend customer management needs.

### B5. Order API Enhancements

- ID: `B5`
- Priority: `P1`
- Status: `DONE`
- Description: Add create/update status/filter/pagination for orders.
- Dependencies: `A2`
- Acceptance criteria:
  - Server-side filtering by status/date/payment method.
  - Consistent totals and invoice fields.

### B6. Menu API Completion

- ID: `B6`
- Priority: `P1`
- Status: `DONE`
- Description: Add update/delete and category normalization for menu resources.
- Dependencies: `A2`
- Acceptance criteria:
  - Full CRUD for menu including image replace flow.
  - Proper validation for price/category/availability.

---

## Epic C: Customer API Layer

### C1. Create Client Route Module

- ID: `C1`
- Priority: `P0`
- Status: `DONE`
- Description: Add `backend/src/routes/client` aggregator and mount client routes in server.
- Dependencies: `A2`
- Acceptance criteria:
  - `/client/*` routes available and documented.

### C2. Customer Menu Browse API

- ID: `C2`
- Priority: `P0`
- Status: `DONE`
- Description: Public/customer endpoint for listing available menu items with search/filter.
- Dependencies: `C1`
- Acceptance criteria:
  - Returns only available items.
  - Supports category + keyword filter.

### C3. Customer Table Availability API

- ID: `C3`
- Priority: `P0`
- Status: `DONE`
- Description: Expose real-time table availability endpoint for booking UI.
- Dependencies: `C1`
- Acceptance criteria:
  - Supports filtering by area/floor/capacity/status.

### C4. Customer Booking API

- ID: `C4`
- Priority: `P0`
- Status: `DONE`
- Description: Create reservation endpoint and state transition logic.
- Dependencies: `C3`
- Acceptance criteria:
  - Prevents booking unavailable tables.
  - Returns clear conflict error when table already reserved.

### C5. Customer Order History API

- ID: `C5`
- Priority: `P1`
- Status: `DONE`
- Description: Fetch customer order history and status timeline.
- Dependencies: `C1`
- Acceptance criteria:
  - Pagination and date filters implemented.

---

## Epic D: Frontend Integration Hardening

### D1. Table Page Data Sync Fix

- ID: `D1`
- Priority: `P0`
- Status: `DONE`
- Description: Fix data-fetch lifecycle to avoid repeated re-fetch loops and ensure stable state updates.
- Note: Fixed stable table fetch lifecycle and wired row status updates to backend with optimistic rollback.
- Dependencies: `B5`, `B4`
- Acceptance criteria:
  - No unnecessary repeated API calls.
  - CRUD updates reflect immediately and correctly.

### D2. Staff Page API-first Flow

- ID: `D2`
- Priority: `P0`
- Status: `DONE`
- Description: Replace local-only mutate logic with backend CRUD integration.
- Note: Staff page now persists add/edit/delete/role/status actions via `/admin/staffs` and maps API errors to toasts.
- Dependencies: `B3`
- Acceptance criteria:
  - Add/edit/delete actions persist to backend.
  - Error toasts map to API responses.

### D3. Analytics Page API Integration

- ID: `D3`
- Priority: `P0`
- Status: `DONE`
- Description: Replace mock analytics data with dashboard/statistics API.
- Note: Analytics tabs and custom date range now fetch data from `/admin/statistics` + `/admin/dashboard` with loading/error states.
- Dependencies: `B1`, `B2`
- Acceptance criteria:
  - Date range and tabs drive backend queries.
  - Charts render API-driven data robustly.

### D4. Customer Book Table API Integration

- ID: `D4`
- Priority: `P0`
- Status: `DONE`
- Description: Replace static table data with live availability + booking endpoints.
- Dependencies: `C3`, `C4`
- Acceptance criteria:
  - Booking updates table state from API response.
  - Validation and conflict handling in UI.

### D5. Customer Menu API Integration

- ID: `D5`
- Priority: `P1`
- Status: `DONE`
- Description: Connect customer menu page to client menu APIs.
- Dependencies: `C2`
- Acceptance criteria:
  - Search/filter/sort operate on API data.

### D6. Order History + Profile Integration

- ID: `D6`
- Priority: `P1`
- Status: `DONE`
- Description: Wire customer order history and profile pages to backend.
- Dependencies: `C5`
- Acceptance criteria:
  - Real customer data visible in both pages.

---

## Epic E: Security & Access Control

### E1. Authentication (Admin + Customer)

- ID: `E1`
- Priority: `P0`
- Status: `DONE`
- Description: Implement login/logout and secure session/token strategy.
- Note: Added admin auth lifecycle endpoints (`/auth/admin/login|me|refresh|logout`) and enforced auth on all `/admin/*` mounts.
- Dependencies: `A1`, `A2`
- Acceptance criteria:
  - Protected routes reject unauthenticated access.
  - Session/token lifecycle handled safely.

### E2. Role-based Authorization

- ID: `E2`
- Priority: `P0`
- Status: `DONE`
- Description: Restrict admin actions by role (admin/waiter/kitchen as applicable).
- Note: Applied role middleware per module (`admin`, `waiter`, `kitchen`) in admin route aggregator.
- Dependencies: `E1`, `B3`
- Acceptance criteria:
  - Permission middleware applied to sensitive routes.

### E3. Input Sanitization & Abuse Protections

- ID: `E3`
- Priority: `P1`
- Status: `DONE`
- Description: Add payload sanitization, rate-limit baseline, and tighter upload validation.
- Note: Added request sanitization + baseline in-memory rate-limit middleware and stricter upload MIME/extension checks.
- Dependencies: `A2`
- Acceptance criteria:
  - Protected against malformed payload and basic abuse scenarios.

---

## Epic F: Performance, Observability, and Release Readiness

### F1. Server-side Pagination for Heavy Lists

- ID: `F1`
- Priority: `P1`
- Status: `DONE`
- Description: Implement list pagination/filtering at API layer for tables/staff/orders/customers.
- Note: Added `page/limit/sort/filter` support and metadata on admin list endpoints.
- Dependencies: `B3`, `B4`, `B5`
- Acceptance criteria:
  - Endpoints support `page`, `limit`, `sort`, and filter params.

### F2. Indexes & Query Optimization

- ID: `F2`
- Priority: `P1`
- Status: `DONE`
- Description: Add Mongo indexes for high-frequency lookups (email, phone, status, createdAt).
- Note: Added model indexes for staff/customer/order/table/menu and documented strategy in `docs/INDEX_STRATEGY.md`.
- Dependencies: `B3`, `B4`, `B5`
- Acceptance criteria:
  - Documented index strategy and measured query improvement.

### F3. Monitoring & Health Endpoint

- ID: `F3`
- Priority: `P2`
- Status: `DONE`
- Description: Add health check and basic operational metrics logging.
- Note: Added `/health` endpoint and request duration metrics logging middleware.
- Dependencies: `A3`
- Acceptance criteria:
  - `/health` reports app + DB connectivity status.

### F4. Release Checklist & Regression Suite

- ID: `F4`
- Priority: `P1`
- Status: `DONE`
- Description: Define release checklist with smoke tests for admin and customer critical journeys.
- Note: Added `docs/RELEASE_CHECKLIST.md` and root smoke command `npm run test:smoke`.
- Dependencies: `A4`, `D1`, `D2`, `D3`, `D4`
- Acceptance criteria:
  - Repeatable pre-release checklist exists and is used.

---

## Suggested Execution Plan (Sprint Order)

Sprint 1 (Critical Core):

- `A1`, `A2`, `B1`, `B3`, `D1`, `D2`, `E1`, `E2`

Sprint 2 (Data Completeness):

- `B2`, `B4`, `B5`, `B6`, `D3`, `F1`, `F2`

Sprint 3 (Hardening & Release):

- `E3`, `A3`, `A4`, `F3`, `F4`

---

## Ready-Next Queue (Top 10)

1. `A1` Environment configuration standardization
2. `A2` Global error/response contract
3. `B3` Staff CRUD API completion
4. `B1` Dashboard controller real data
5. `D1` Table page data sync fix
6. `D2` Staff page API-first flow
7. `D3` Analytics page API integration
8. `B2` Statistics controller real aggregations
9. `B4` Customer CRUD API completion
10. `B5` Order API enhancements
