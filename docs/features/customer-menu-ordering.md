# Customer Feature: Menu Browsing & Cart

## Goal

Provide a customer-facing menu browsing and cart experience that supports discovery and quick ordering.

## Scope

- Customer route: `/customer/menu`
- Frontend page: `frontend/src/features/customer-menu/pages/customer-menu-page.jsx`
- Backend APIs:
  - `GET /client/menus`
  - `POST /client/orders` (checkout endpoint)

## Current Implementation Status

- Status: API-backed menu browsing and checkout are implemented.
- Item list, categories, and cart logic now resolve against backend data.

## Behavior Implemented

- Search and category filtering.
- Add/remove quantity in cart.
- Running total calculation and interactive product cards.
- Checkout posts persistent orders to the customer backend.

## Gaps / Risks

- Menu and category sync still depend on the admin data model staying consistent.
- Availability should continue to be validated before checkout.
- Payment and confirmation policy may still need to be formalized in product rules.

## Recommended Milestones

1. Keep menu/category response shapes stable for the cart UI.
2. Add any missing checkout validation rules if pricing or payment policy changes.
3. Tighten empty-state and error-state handling for failed menu fetches or submissions.

## Acceptance Criteria (Target)

- Menu reflects real backend data.
- Cart checkout creates persistent order.
- Unavailable items are blocked before confirmation.
- User feedback for order success/failure is clear.
