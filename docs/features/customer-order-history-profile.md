# Customer Feature: Order History & Profile

## Goal

Give customers access to their past orders, profile details, addresses, and security/account settings.

## Scope

- Customer routes:
  - `/customer/orders`
  - `/customer/profile`
  - `/customer/dashboard`
- Frontend pages:
  - `frontend/src/features/customer-orders/pages/order-history-page.jsx`
  - `frontend/src/features/profile/pages/profile-page.jsx`
  - `frontend/src/features/customer-dashboard/pages/customer-dashboard-page.jsx`
- Backend APIs:
  - `GET /client/orders`
  - `GET/PUT /client/profile`
  - `GET/POST/PUT/DELETE /client/addresses`

## Current Implementation Status

- Status: API-backed and connected to the customer auth/session flow.
- Dashboard, order history, profile, password, notification settings, and addresses now use the backend.

## Behavior Implemented

- Order list filtering and expandable detail cards.
- Profile view/edit tabs, password changes, and address default toggling.
- Dashboard quick summary cards and recent order data from `/client/dashboard`.

## Gaps / Risks

- Session expiry handling should stay aligned with refresh-token behavior.
- Customer-facing error/loading states should remain consistent across the three pages.
- Address and profile field changes need to stay aligned with backend schema validation.

## Recommended Milestones

1. Keep customer auth/session handling consistent across all pages.
2. Tighten error messaging for profile and address updates.
3. Add any missing account-level polish or analytics if the product expands.

## Acceptance Criteria (Target)

- Customer sees only their own orders/profile.
- Profile/address changes persist after refresh.
- Dashboard summary values are generated from real data.
- Unauthorized access is prevented by route guards.
