# Coding Rules & Conventions

## 1) Project-Wide Standards

### Module System

- Use ES modules (`import`/`export`) across frontend and backend.
- Backend files use `.js`.
- Frontend component files use `.jsx`; utility/service files use `.js`.

### Naming

- Files/directories: kebab-case (`table-page.jsx`, `customer-layout.jsx`).
- Functions/variables: camelCase.
- React components: PascalCase.
- Constants: UPPER_SNAKE_CASE.

### Language

- UI and user-facing messages: Vietnamese.
- Code comments and technical identifiers: English-first.

---

## 2) Backend Conventions

### Structure

```
backend/src/
├── server.js
├── configs/
├── models/
├── controllers/admin/
├── controllers/client/
├── routes/admin/
├── routes/client/
├── routes/auth.route.js
└── middlewares/
```

### API Rules

- Keep controllers lean: validate input -> execute model/service logic -> return response.
- Use clear status codes (`200`, `201`, `400`, `404`, `500`).
- Return user-friendly error messages; never expose raw stack traces.
- Apply `try/catch` around async I/O.

### Data & Validation

- Put schema constraints in Mongoose models.
- Keep enums explicit for constrained fields (`status`, `paymentMethod`, etc.).
- Add server-side validation even if client validation exists.

---

## 3) Frontend Conventions (Feature-First)

### Structure

```
frontend/src/
├── app/
│   └── App.jsx
├── main.jsx
├── layouts/
│   ├── admin-layout.jsx
│   └── customer-layout.jsx
├── features/
│   ├── dashboard/
│   ├── tables/
│   ├── menu/
│   ├── staff/
│   ├── orders/
│   ├── analytics/
│   ├── customers/
│   └── customer-*/
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── hooks/
│   ├── utils/index.js
│   └── styles/index.css
└── services/
    ├── api/client.js
    └── customer-session.js
```

### Import Rules

- Shared UI primitives: `@/shared/components/ui/...`
- Shared layout components: `@/shared/components/layout/...`
- API client: `@/services/api/client`
- Shared utilities: `@/shared/utils`
- Feature-local imports should stay inside their feature when possible.

### Component Boundaries

- Put route pages under `features/<feature>/pages`.
- Put feature-specific components under `features/<feature>/components`.
- Put only truly reusable components under `shared/components`.

---

## 4) Forms, State, and API

### Forms

- Use React Hook Form + Zod for non-trivial forms.
- Keep schemas close to feature pages/components.

### State

- Keep local UI state in feature components.
- Avoid unnecessary global state.
- Avoid anti-pattern effects that trigger cascading renders.

### API

- All HTTP calls should use `services/api/client.js`.
- Avoid hardcoded API URLs in feature files.
- Centralize interceptors and shared error handling in API client layer.

---

## 5) Styling & UI

- Use Tailwind utilities + shared UI primitives.
- Keep visual consistency through shared components.
- Keep reusable patterns in `shared/components/ui` and `shared/components/layout`.

---

## 6) Quality Rules

### Must-pass checks

- Frontend must build successfully (`npm run build`).
- Lint warnings/errors should be resolved for changed files whenever possible.

### Cleanup expectations

- Remove temporary debug logs (`console.log`) in production paths.
- Remove dead code and unused imports.
- Keep docs aligned after structural changes.

---

## 7) Documentation Sync Policy

When folder structure or import conventions change, update at minimum:

- `docs/PROJECT_SUMMARY.md`
- `docs/AI_CONTEXT.md`
- `docs/features/*`
- `docs/RULES.md`
