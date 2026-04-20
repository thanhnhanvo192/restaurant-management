# Customer Feature: Dola Restaurant Layout Translation Checklist

## Goal

Translate the visual language and layout logic of the Dola Restaurant demo into the restaurant management project as a customer-facing experience, while keeping the implementation original and aligned with the app's existing route structure, data flow, and auth/session behavior.

## Source of Inspiration

Reference layout theme:

- Dola Restaurant demo: restaurant storefront-style homepage
- Key traits observed:
  - Strong top navigation and brand presence
  - Large hero section with image, overlay, and CTA
  - Card-based featured content blocks
  - Clear category/catalog browsing pattern
  - Dense trust-oriented footer/info sections
  - Responsive behavior across desktop and mobile

## Translation Principles

1. Do not copy the demo literally.
2. Rebuild the experience using the project's own components, routes, and data.
3. Preserve the existing customer flows:
   - View menu
   - Book a table
   - Place an order
   - View order history
   - Manage profile
4. Use the demo as a structural and experiential reference, not as an asset or code source.
5. Keep the visual direction consistent with the selected project palette: background #10302C and primary accents #D69C52.

## File-by-File Checklist

### 1. `frontend/src/layouts/customer-layout.jsx`

- [ ] Keep header-top as the primary navigation surface.
- [ ] Preserve sticky behavior and responsive breakpoints.
- [ ] Keep brand, navigation, quick actions, notification, and profile controls in the top header.
- [ ] Keep bottom navigation for mobile only.
- [ ] Remove any remaining sidebar-first assumptions.
- [ ] Verify existing route targets remain unchanged.

### 2. `frontend/src/features/customer-dashboard/pages/customer-home-page.jsx`

- [ ] Convert the page into a storefront-style landing area.
- [ ] Add a large hero section with restaurant imagery, overlay gradient, and primary CTA.
- [ ] Ensure hero banner gradients use project tokens/colors (#10302C and #D69C52) instead of legacy sky/cyan tones.
- [ ] Keep booking and ordering as the main hero actions.
- [ ] Present featured dishes as prominent cards.
- [ ] Add or refine benefit/trust cards to match a restaurant homepage feel.
- [ ] Keep the page lively and promotional without adding heavy logic.

### 3. `frontend/src/features/customer-menu/pages/customer-menu-page.jsx`

- [ ] Organize the menu as a browseable catalog.
- [ ] Use large cards with image, category badge, price, description, and add-to-cart CTA.
- [ ] Keep search and category filtering prominent.
- [ ] Preserve cart panel and checkout behavior.
- [ ] Align spacing, surface, and accent colors with the new customer theme.

### 4. `frontend/src/features/customer-booking/pages/book-table-page.jsx`

- [ ] Present booking as a service-focused flow.
- [ ] Keep table cards visually clear and easy to scan.
- [ ] Retain dialog, validation, and booking mutation logic.
- [ ] Emphasize speed, clarity, and trust.
- [ ] Keep status colors and card rhythm consistent with the customer shell.

### 5. `frontend/src/features/customer-orders/pages/order-history-page.jsx`

- [ ] Present order history as an account dashboard area.
- [ ] Use summary cards for quick stats.
- [ ] Keep expandable cards or timeline-like rows readable.
- [ ] Keep status visibility strong.
- [ ] Align search/filter and empty states with the new palette.

### 6. `frontend/src/features/profile/pages/profile-page.jsx`

- [ ] Organize profile into card sections.
- [ ] Reduce dense form noise.
- [ ] Keep address, password, notification, and account details grouped clearly.
- [ ] Make sure the page feels like a customer account area, not an admin form.

### 7. `frontend/src/shared/styles/index.css`

- [ ] Keep customer-scoped theme tokens in sync with the current project palette (#10302C background, #D69C52 primary).
- [ ] Ensure primary, soft surface, border, and text accent tokens remain consistent.
- [ ] Avoid reintroducing hardcoded orange/amber accents in customer pages.

## Visual Translation Rules

- [ ] Prefer large rounded corners.
- [ ] Prefer soft shadows and subtle borders.
- [ ] Keep whitespace generous.
- [ ] Use hero banners for high-value pages.
- [ ] Use cards as the main content unit.
- [ ] Use a clear hierarchy of primary, secondary, and tertiary actions.
- [ ] Maintain readable contrast for all text and CTA surfaces.
- [ ] Ensure the current project palette remains consistent across customer pages.

## Implementation Phases

### Phase 1: Shell Alignment

- [ ] Keep the top-header customer layout as the main shell.
- [ ] Tune navigation and quick actions to support a storefront-style experience.
- [ ] Make the shell feel more like a customer storefront than an admin console.

### Phase 2: Home Page Redesign

- [ ] Adjust the hero composition to feel closer to a restaurant homepage.
- [ ] Improve featured dish presentation and action hierarchy.
- [ ] Add more polished trust/benefit cards.

### Phase 3: Page Synchronization

- [ ] Align menu page cards and filters to the same visual language.
- [ ] Align booking page and order history page to the same card rhythm.
- [ ] Align profile page sections to the same spacing and surface treatment.

### Phase 4: Responsive QA

- [ ] Validate desktop/tablet/mobile breakpoints.
- [ ] Ensure header and bottom nav do not overlap content.
- [ ] Ensure CTA buttons remain accessible and visible.
- [ ] Validate contrast and touch target sizes.

## Suggested Execution Order

1. `frontend/src/shared/styles/index.css`
2. `frontend/src/layouts/customer-layout.jsx`
3. `frontend/src/features/customer-dashboard/pages/customer-home-page.jsx`
4. `frontend/src/features/customer-menu/pages/customer-menu-page.jsx`
5. `frontend/src/features/customer-booking/pages/book-table-page.jsx`
6. `frontend/src/features/customer-orders/pages/order-history-page.jsx`
7. `frontend/src/features/profile/pages/profile-page.jsx`

## Constraints

- No backend changes.
- No route path changes.
- No auth/session contract changes.
- No copying of Dola assets, text, or proprietary code.
- Only translate the layout pattern and user experience.

## Risks

- Overloading the home page with too many hero elements can make the UI heavy.
- Hero imagery must be optimized to avoid slow load times.
- Theme consistency may drift if subpages keep too many old warm/orange hardcoded classes.
- Mobile layout can become cramped if quick actions or nav labels are too long.

## Verification Checklist

- [ ] Customer pages still load with existing route structure.
- [ ] Header-top shell feels more like a storefront than a dashboard.
- [ ] Home page communicates brand, value, and action clearly.
- [ ] Menu/booking/orders/profile remain functional after visual changes.
- [ ] Project palette (#10302C / #D69C52) is applied consistently.
- [ ] Frontend build succeeds.
- [ ] Responsive behavior works at mobile, tablet, and desktop widths.

## Acceptance Criteria

- [ ] The customer experience feels inspired by Dola Restaurant's storefront structure.
- [ ] The implementation is original and fits the management project.
- [ ] The customer shell is cohesive, responsive, and visually polished.
- [ ] The main customer flows remain unchanged in behavior.
