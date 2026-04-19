# Index Strategy and Query Optimization

## Scope (F2)

This repository adds baseline indexes for high-frequency list and lookup paths used by admin/customer flows:

- `Staff`: email, role+active, createdAt, fullName
- `Customer`: phone, email (sparse), tier+isLocked, createdAt, name
- `Order`: customerId+createdAt, status+createdAt, paymentMethod+createdAt, createdAt, customerSnapshot.phone
- `Table`: tableNumber, status+createdAt, area+status, createdAt
- `Menu`: categoryId+available, available+createdAt, name, createdAt

## Expected Impact

- Faster paging and sort by `createdAt` on heavy lists.
- Better filter performance for status/payment/role/tier combinations.
- Improved lookup speed for unique identity fields (email/phone/tableNumber/orderCode).

## Validation Checklist

Run these checks in a development environment with real data:

1. `explain("executionStats")` before/after on list queries.
2. Confirm index scan usage (`IXSCAN`) instead of collection scan (`COLLSCAN`).
3. Track p95 response time for `/admin/orders`, `/admin/customers`, `/admin/staffs`, `/admin/tables`.

Suggested target:

- Reduce p95 list endpoint latency by at least 30% under representative dataset volume.

## Notes

- Avoid adding redundant overlapping indexes unless query profiles justify it.
- Revisit index set after workload profiling in production-like data.
