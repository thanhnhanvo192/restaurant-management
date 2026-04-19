# Testing Guide

## Test Stack

- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library

## Commands

From repository root:

- `npm run test` - run backend and frontend tests
- `npm run test:backend` - run backend tests only
- `npm run test:frontend` - run frontend tests only

Backend (package-level):

- `npm test --prefix backend`
- `npm run test:watch --prefix backend`
- `npm run test:coverage --prefix backend`

Frontend (package-level):

- `npm test --prefix frontend`
- `npm run test:watch --prefix frontend`
- `npm run test:coverage --prefix frontend`

## Current Baseline

- Backend API tests for table, menu, order, staff, and customer resources.
- Frontend smoke tests for admin pages covering table, menu, order, staff, and customer resources.
- Baseline smoke test for server root endpoint.
- Baseline smoke test for NotFound page rendering.

## Next Coverage Milestone

Expand assertions from smoke/contract checks to richer CRUD flows and edge-case validation.
