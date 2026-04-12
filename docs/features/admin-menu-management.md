# Admin Feature: Menu Management

## Goal

Manage menu items, categories, prices, availability, and item images for restaurant operations.

## Scope

- Admin route: `/admin/menu`
- Frontend pages:
  - `frontend/src/features/menu/pages/menu-page.jsx`
  - `frontend/src/features/menu/pages/manage-menu-page.jsx`
- Backend endpoints:
  - `GET /admin/menus`
  - `POST /admin/menus` (with image upload)

## Current Implementation Status

- Status: Partially implemented.
- Frontend has rich UX: filters, selection, dialogs, image preview, category handling.
- Backend currently supports list and create only.

## Behavior Implemented

- Load menu from API and normalize records.
- Create item with validation and optional image.
- Compute item status and best-seller display in UI.
- Build absolute image URL from server path.

## Gaps / Risks

- Missing backend update/delete endpoints for full lifecycle.
- Category management is mostly frontend-local and not persisted server-side.
- Availability and sold count update flows are not fully API-driven.

## Recommended Milestones

1. Add `PUT /admin/menus/:id` and `DELETE /admin/menus/:id`.
2. Add category persistence model/API or align on enum strategy.
3. Add availability toggle endpoint and soldCount update policy.
4. Validate image type/size and error mapping consistently in UI.

## Acceptance Criteria (Target)

- Full menu CRUD available and persistent.
- Category changes survive page refresh.
- Image workflow stable for create and edit.
- Filtering/search reflect latest backend state.
