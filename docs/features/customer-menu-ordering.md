# Customer Feature: Menu Browsing & Cart

## Goal

Provide a customer-facing menu browsing and cart experience that supports discovery and quick ordering.

## Scope

- Customer route: `/customer/menu`
- Frontend page: `frontend/src/features/customer-menu/pages/customer-menu-page.jsx`
- Expected backend APIs (not yet implemented):
  - `GET /client/menus`
  - `POST /client/orders` (or cart checkout endpoint)

## Current Implementation Status

- Status: Visual UX complete but currently mock-data based.
- Item list, categories, and cart logic exist client-side only.

## Behavior Implemented

- Search and category filtering.
- Add/remove quantity in cart.
- Running total calculation and interactive product cards.

## Gaps / Risks

- Menu data not synchronized with admin menu backend.
- Cart/order actions are not persisted server-side.
- Price and availability can diverge from actual backend data.

## Recommended Milestones

1. Implement client menu browse endpoint with availability filtering.
2. Connect frontend menu list to API.
3. Introduce checkout endpoint with order creation.
4. Add stock/availability check before submit.

## Acceptance Criteria (Target)

- Menu reflects real backend data.
- Cart checkout creates persistent order.
- Unavailable items are blocked before payment/confirm.
- User feedback for order success/failure is clear.
