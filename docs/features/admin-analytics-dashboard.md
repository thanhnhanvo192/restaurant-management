# Admin Feature: Dashboard & Analytics

## Goal

Expose restaurant KPIs and trends (revenue, orders, category contribution, top staff/items) for decision-making.

## Scope

- Admin routes:
  - `/admin/dashboard`
  - `/admin/statistics`
- Frontend pages:
  - `frontend/src/features/dashboard/pages/dashboard-page.jsx`
  - `frontend/src/features/analytics/pages/analytics-dashboard-page.jsx`
- Backend endpoints currently available:
  - `GET /admin/dashboard` (placeholder)
  - `GET /admin/statistics` (empty array)

## Current Implementation Status

- Status: Mostly scaffolded backend; rich mock-driven frontend analytics UI.
- Analytics page provides charts, tabs, and date range interactions using local mock data.

## Behavior Implemented

- Client-side KPI rendering and charts.
- Simulated custom-range analytics generation.
- Multi-timespan dashboard views (today/week/month).

## Gaps / Risks

- Backend endpoints do not provide production analytics data.
- Mismatch risk between frontend chart shape and future backend response format.
- No real aggregation pipeline from orders/customers/staff/models.

## Recommended Milestones

1. Define API contract for dashboard/statistics payloads.
2. Implement DB aggregations and date-range filters.
3. Wire analytics frontend to API and remove mock constants.
4. Add loading and empty-state UX for no-data windows.

## Acceptance Criteria (Target)

- Dashboard and analytics are API-backed.
- Date range filters generate consistent server-derived metrics.
- Chart data contracts are stable and documented.
- Frontend no longer depends on mock analytics constants.
