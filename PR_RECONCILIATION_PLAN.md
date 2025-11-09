# PR Reconciliation Plan

## Overview
8 sequential PRs (v1.6.0 through v1.6.7) need to be merged in order.

## PR Dependency Chain

1. **PR #36: v1.6.0** - Answer Cards & Citations (Austin) - BASE
   - Branch: `answers/v1.6.0-austin`
   - Status: MERGEABLE, BLOCKED (CI checks)

2. **PR #37: v1.6.1** - Answer Cards Review Loop
   - Branch: `answers/review-1.6.1`
   - Depends on: PR #36
   - Status: MERGEABLE, BLOCKED (CI checks)

3. **PR #38: v1.6.2** - Austin Overlays & Exceptions Resolver
   - Branch: `answers/overlays-1.6.2`
   - Depends on: PR #37
   - Status: MERGEABLE, BLOCKED (CI checks)

4. **PR #39: v1.6.3** - Multi-Jurisdiction (ETJ pilot)
   - Branch: `answers/juris-1.6.3`
   - Depends on: PR #38
   - Status: MERGEABLE, BLOCKED (CI checks)

5. **PR #40: v1.6.4** - Citation Integrity & Versioning
   - Branch: `citations/versioning-1.6.4`
   - Depends on: PR #39
   - Status: MERGEABLE, BLOCKED (CI checks)

6. **PR #41: v1.6.5** - Shareable Parcel Report
   - Branch: `report/share-1.6.5`
   - Depends on: PR #40
   - Status: MERGEABLE, BLOCKED (CI checks)

7. **PR #42: v1.6.6** - Natural Language Query Router
   - Branch: `nlu/router-1.6.6`
   - Depends on: PR #41
   - Status: MERGEABLE, BLOCKED (CI checks)

8. **PR #43: v1.6.7** - Answer Trace System
   - Branch: `answers/trace-1.6.7`
   - Depends on: PR #42
   - Status: MERGEABLE, BLOCKED (CI checks)

## Reconciliation Strategy

### Option 1: Sequential Merge (Recommended)
Merge PRs in order (36 → 37 → 38 → 39 → 40 → 41 → 42 → 43) after CI passes.

### Option 2: Rebase Chain
Rebase each PR on the previous one to create a linear history:
- PR #37 rebased on PR #36
- PR #38 rebased on PR #37
- etc.

### Option 3: Merge All at Once
If all PRs pass CI and have no conflicts, merge all sequentially in one batch.

## Current Status
All PRs are marked as MERGEABLE but BLOCKED by branch protection (likely CI checks).

## Next Steps
1. Wait for CI checks to pass on all PRs
2. Merge PR #36 first
3. Update PR #37 to rebase on main (after #36 merges)
4. Continue sequentially for remaining PRs

