## Description
Briefly describe the changes made in this PR and why they are necessary.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement / Refactoring

## Financial Safety Checklist
- [ ] Strictly zero floating-point arithmetic used (all monetary math uses `Decimal` with 6 decimals).
- [ ] Double-entry ledger invariants preserved ($\sum \text{Debits} = \sum \text{Credits}$).
- [ ] Idempotency keys honored on payment/transaction creation endpoints.
- [ ] Server-side policy engine evaluates spending limits prior to ledger execution.
- [ ] Unit & integration tests added/updated (`pytest` passing 100%).
- [ ] Frontend build succeeds cleanly (`npm run build`).
