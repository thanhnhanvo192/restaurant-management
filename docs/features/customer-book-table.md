# Customer Feature: Book Table

## Goal

Allow customers to browse available tables by area/floor and place reservations with validation.

## Scope

- Customer route: `/customer/book-table`
- Frontend page: `frontend/src/features/customer-booking/pages/book-table-page.jsx`
- Expected backend APIs (not yet implemented):
  - `GET /client/tables` (availability)
  - `POST /client/bookings` (reservation create)

## Current Implementation Status

- Status: UI complete but mock/local-state driven.
- No customer backend route/controller currently exists.

## Behavior Implemented

- Floor tabs and table grid visualization.
- Reservation dialog with validation (date/time/guest count).
- Local status transition from available -> reserved after booking.

## Gaps / Risks

- Reservation data not persisted.
- Concurrency conflicts cannot be handled (two users booking same table).
- No server-side business rules for booking windows/capacity checks.

## Recommended Milestones

1. Build client table availability and booking APIs.
2. Replace local table source with API data.
3. Add conflict responses and optimistic UI rollback.
4. Persist booking history linked to customer identity.

## Acceptance Criteria (Target)

- Table availability comes from backend.
- Booking creates a persistent reservation.
- Conflicts are safely handled with user feedback.
- Refreshing page keeps latest booking state.
