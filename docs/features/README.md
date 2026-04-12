# Feature Catalog

This folder contains feature-level specifications for the restaurant-management codebase.

## How to Use

- Read each file as the source of truth for a specific product area.
- Each feature file includes:
  - Goal and scope
  - Current implementation status
  - UI coverage
  - Backend API coverage
  - Gaps and risks
  - Next implementation milestones

## Feature Files

- `admin-table-management.md`
- `admin-menu-management.md`
- `admin-staff-management.md`
- `admin-customer-management.md`
- `admin-invoice-orders.md`
- `admin-analytics-dashboard.md`
- `customer-book-table.md`
- `customer-menu-ordering.md`
- `customer-order-history-profile.md`

## Notes

- Route map comes from `frontend/src/app/App.jsx` and `backend/src/routes/admin/index.route.js`.
- Customer backend route/controller layer is currently missing (`backend/src/routes/client`, `backend/src/controllers/client`).
- Prioritized implementation work is tracked in `docs/tasks.md`.
