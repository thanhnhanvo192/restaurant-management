# Admin Feature: Staff Management

## Goal

Allow administrators to maintain staff directory, role assignments, activation status, and account lifecycle.

## Scope

- Admin route: `/admin/staffs`
- Frontend page: `frontend/src/features/staff/pages/staff-page.jsx`
- Backend endpoint currently available:
  - `GET /admin/staffss`

## Current Implementation Status

- Status: Incomplete integration.
- Frontend has mature UI for add/edit/status/role interactions.
- Backend only provides list operation.

## Behavior Implemented

- Staff list fetch from API.
- Client-side pagination, search, edit dialog, role/status toggles.
- Form validation with Zod and React Hook Form.

## Gaps / Risks

- Add/edit/toggle role/status currently mutate local state only.
- Missing backend CRUD endpoints for staff records.
- Debug logging remains in backend/frontend (`console.log`).

## Recommended Milestones

1. Implement backend create/update/delete staff endpoints.
2. Persist active/role changes through API.
3. Remove debug logs and add intentional error handling.
4. Add duplicate email conflict handling.

## Acceptance Criteria (Target)

- Every staff action persists to database.
- UI state always sourced from backend truth.
- Proper error toasts for validation/conflicts/server failures.
- Role and active status updates are auditable and consistent.
