# Admin Feature: Table Management

## Goal

Enable staff/admin to manage restaurant tables including create, update, delete, filter, and quick status visibility.

## Scope

- Admin route: `/admin/tables`
- Frontend page: `frontend/src/features/tables/pages/table-page.jsx`
- Backend endpoints:
  - `GET /admin/tables`
  - `POST /admin/tables`
  - `PUT /admin/tables/:id`
  - `DELETE /admin/tables/:id`

## Current Implementation Status

- Status: API-backed CRUD is implemented, with a couple of UI polish issues remaining.
- Backend CRUD exists in `table.controller.js`.
- Frontend UI includes search, filtering, paging, add/edit drawer, and delete actions.

## Behavior Implemented

- Filter by table number and status.
- Validate table form before submit.
- Create/update/delete through API.
- Toast feedback for success/failure.

## Gaps / Risks

- Data fetching effect still depends on `tables`, causing repeated re-fetch loops.
- Validation is mostly frontend-side; backend validation can be stricter.
- API response shape is inconsistent with other modules.

## Recommended Milestones

1. Fix `useEffect` dependency to avoid loop and network churn.
2. Standardize backend response envelope.
3. Add backend validation for duplicate table number and invalid payloads.
4. Add pagination/filtering query support on backend for scale.

## Acceptance Criteria (Target)

- One initial fetch on page load, then explicit refreshes after mutations.
- No duplicate re-renders from fetch loop.
- CRUD actions remain responsive and consistent.
- Backend rejects invalid/duplicate records with clear error messages.
