# Release Checklist and Regression Suite

## Purpose (F4)

Provide a repeatable pre-release process for admin and customer critical journeys.

## Pre-release Checklist

1. Environment

- `.env` values are set for backend/frontend.
- `MONGO_URL`, `CORS_ORIGIN`, `VITE_API_BASE_URL` verified.

2. Build and static checks

- Frontend build passes: `npm run build --prefix frontend`
- No new lint/type errors in changed files.

3. Security baseline

- `/admin/*` routes require admin auth token.
- Role-based authorization returns `AUTH_FORBIDDEN` when role is insufficient.
- Rate-limit and payload sanitization middleware are active.
- Upload validation accepts only allowed image mime/extensions.

4. Health and observability

- `/health` returns app status and DB state.
- Request metrics are logged (method/path/status/duration).

5. Regression suite

- Run smoke suite: `npm run test:smoke`
- Run full tests: `npm run test`

## Smoke Coverage

Admin critical paths:

- Table, menu, order, staff, customer management baseline tests.
- Dashboard/statistics baseline tests.

Platform/API critical paths:

- Root and `/health` endpoint tests.

Frontend admin critical pages:

- Admin table/menu/order/staff/customer smoke tests.

## Release Gate

A release is ready only when:

- Checklist items are completed.
- Smoke suite passes.
- No critical or high-severity open defects remain.
