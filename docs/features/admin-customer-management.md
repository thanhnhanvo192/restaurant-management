# Admin Feature: Customer Management

## Goal
Manage customer profiles, loyalty insights, lock state, and customer-level engagement actions.

## Scope
- Admin route: `/admin/customers`
- Frontend page: `frontend/src/features/customers/pages/manage-customers-page.jsx`
- Backend endpoint currently available:
  - `GET /admin/customers`

## Current Implementation Status
- Status: Partially implemented.
- Frontend has analytics cards, paginated list, detail sheet, reward and lock action UI.
- Backend currently supports list only.

## Behavior Implemented
- Fetch customer list from API.
- Display loyalty tier, points, recent activity.
- Client-side search and paging.

## Gaps / Risks
- No backend endpoints for update/reward/lock actions.
- Action buttons can be UI-only if not connected to API mutations.
- Customer schema fields and UI fields must stay aligned (name/phone/tier/points).

## Recommended Milestones
1. Add customer update endpoints (tier, points, lock, note).
2. Add action-specific endpoints or command-style updates.
3. Validate field constraints and audit critical state changes.

## Acceptance Criteria (Target)
- Reward points and lock/unlock actions are persisted.
- Customer detail updates are reflected on reload.
- Error and permission handling is explicit.
