# Admin Feature: Orders & Invoices

## Goal

Provide operational visibility over orders, payment methods, statuses, and invoice-level details for review/export.

## Scope

- Admin route: `/admin/orders`
- Frontend page: `frontend/src/features/orders/pages/manage-invoices-page.jsx`
- Backend endpoint currently available:
  - `GET /admin/orders`

## Current Implementation Status

- Status: Partially implemented.
- Frontend has robust invoice table UI, filters, date range, and detail dialog.
- Backend currently offers list-only endpoint.

## Behavior Implemented

- Fetch invoices/orders from API.
- Client-side search/filter by payment and date range.
- Invoice detail calculations (subtotal, VAT, total) on frontend.

## Gaps / Risks

- Missing create/update/cancel/confirm order workflows in admin API.
- Export action currently depends on frontend logic; no server export endpoint.
- Order data model uses CommonJS while rest of backend uses ESM.

## Recommended Milestones

1. Normalize order model module format to ESM.
2. Add order mutation endpoints (status transitions).
3. Add server-side filtering and pagination.
4. Add export endpoint (CSV/XLSX/PDF) if required by product.

## Acceptance Criteria (Target)

- Order list supports server-side filter/pagination.
- Status transitions are validated and persisted.
- Invoice totals remain consistent with stored order items.
- Export output matches current filtered view.
