# Customer Feature: Book Table

## Goal

Allow customers to browse available tables by area/floor and place reservations with validation.

## Scope

- Customer route: `/customer/book-table`
- Frontend page: `frontend/src/features/customer-booking/pages/book-table-page.jsx`
- Backend APIs:
  - `GET /client/tables` (availability)
  - `POST /client/bookings` (reservation create)

## Current Implementation Status

- Status: API-backed and connected to the customer backend.
- Customer backend route/controller layer exists and enforces auth on booking actions.

## Behavior Implemented

- Floor tabs and table grid visualization.
- Reservation dialog with validation (date/time/guest count).
- Booking creates a persistent reservation and refreshes table state from API responses.

## Gaps / Risks

- Conflict handling still depends on backend error responses being surfaced clearly in the UI.
- Booking windows/capacity checks should stay enforced server-side.
- Table availability should remain consistent after refresh and across sessions.

## Recommended Milestones

1. Tighten conflict/error messaging for booking failures.
2. Keep availability data fresh after booking mutations.
3. Add any missing capacity/window validation rules if product policy changes.

## Acceptance Criteria (Target)

- Table availability comes from backend.
- Booking creates a persistent reservation.
- Conflicts are safely handled with user feedback.
- Refreshing page keeps latest booking state.
