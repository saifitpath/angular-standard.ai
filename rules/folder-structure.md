# Approved Folder Structure

> Defines where Angular application files may be created or modified.
> All generated code must conform to these paths.

## Approved Locations

```
src/app/
├── features/<feature-name>/     ← Feature-specific pages, routes, and local services
├── shared/
│   ├── ui/                      ← Reusable presentational components (design system)
│   └── data-access/             ← Shared API services, models, and state stores
├── core/                        ← App-wide singletons (guards, interceptors, config)
└── layout/                      ← Shell layouts (header, footer, sidebar)
```

## Feature Folder Layout

Each feature under `src/app/features/<feature-name>/` should follow:

```
features/<feature-name>/
├── <feature-name>.routes.ts
├── pages/
│   └── <page-name>/
│       ├── <page-name>.component.ts
│       ├── <page-name>.component.html
│       └── <page-name>.component.scss
├── components/                  ← Feature-scoped presentational components
├── data-access/                 ← Feature-scoped API services and models
└── models/                      ← Feature-scoped type definitions
```

## Shared UI (`src/app/shared/ui/`)

- Contains reusable, project-agnostic UI primitives (buttons, dialogs, tables, etc.).
- Third-party UI libraries (e.g. PrimeNG) may only be imported inside `shared/ui/` wrapper components.
- Feature and layout code must consume shared UI via the design system — never import third-party UI directly.

## Shared Data Access (`src/app/shared/data-access/`)

- Cross-feature API services and shared state.
- Typed models co-located with their services.
- No component logic — services only.

## Validation Rules

When validating file paths, the following patterns are **approved**:

| Pattern | Purpose |
|---------|---------|
| `src/app/features/<feature>/` | Feature code |
| `src/app/shared/ui/` | Design system components |
| `src/app/shared/data-access/` | Shared API layer |

Files generated **outside** these locations (unless explicitly scoped to `core/` or `layout/` with architect approval) are violations.

## Path Normalization

- Always use forward slashes (`/`) in path validation.
- Paths are case-sensitive on Linux CI — use kebab-case folder names.
- Feature names must be lowercase kebab-case (e.g. `payment-plans`, not `PaymentPlans`).

## Examples

| Path | Status |
|------|--------|
| `src/app/features/payments/pages/payment-list/payment-list.component.ts` | ✅ Approved |
| `src/app/shared/ui/button/button.component.ts` | ✅ Approved |
| `src/app/shared/data-access/accounts/accounts-api.service.ts` | ✅ Approved |
| `src/app/components/payment-list/payment-list.component.ts` | ❌ Violation — use `features/` |
| `src/services/accounts.service.ts` | ❌ Violation — use `shared/data-access/` |
| `src/app/payments/payment.component.ts` | ❌ Violation — use `features/payments/` |
