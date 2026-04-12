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
- Expected backend APIs (not yet implemented):
  - `GET /client/orders`
  - `GET/PUT /client/profile`
  - `GET/POST/PUT /client/addresses`

## Current Implementation Status

- Status: Mostly mock-driven UI.
- Dashboard, order history, and profile currently rely on local/mock data.

## Behavior Implemented

- Order list filtering and expandable detail cards.
- Profile view/edit tabs and address default toggling.
- Dashboard quick summary cards and recent order placeholders.

## Gaps / Risks

- No customer authentication context; identity is implicit/mock.
- Profile and address edits are not persisted.
- Order history not sourced from backend order records.

## Recommended Milestones

1. Build customer identity/auth layer.
2. Add profile and order-history APIs.
3. Replace local state and mock constants with API fetch/mutation flows.
4. Add loading/error/empty states for all customer account screens.

## Acceptance Criteria (Target)

- Customer sees only their own orders/profile.
- Profile/address changes persist after refresh.
- Dashboard summary values are generated from real data.
- Unauthorized access is prevented by route guards.
