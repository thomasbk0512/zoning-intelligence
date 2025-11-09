# Release Notes v1.4.0-rc.1

## Pre-GA Release Candidate

This is the first release candidate for v1.4.0, preparing for general availability (GA).

## Highlights

### Schema Freeze
- **UI Schema Locked**: 11-field output schema frozen with `SCHEMA_LOCK.json`
- **Telemetry Contract Pinned**: Event schema version 1.0.0 pinned
- **Change Control**: Documented compatibility rules in `SCHEMA_COMPAT.md` and `TELEMETRY_CONTRACT.md`

### In-App Help & Diagnostics
- **Help Panel**: Accessible help panel with quick start, search tips, error glossary, keyboard shortcuts
- **Diagnostics Panel**: Build information, quality gates status, feature flags, Web Vitals
- **Accessible**: Focus trap, ARIA modal, keyboard navigation (Esc to close)
- **Discoverable**: Help button in header, diagnostics via `?debug=1` parameter

### Documentation
- **User Guide**: Comprehensive guide covering all features and workflows
- **Diagnostics Guide**: How to access and use diagnostics for troubleshooting
- **Accessibility Statement**: WCAG 2.1 AA compliance statement
- **Schema Compatibility**: Change control rules for schema evolution

### Build Metadata
- **Build Info Injection**: Automatic injection of version, git SHA, build time, CI run URL
- **Quality Gates Summary**: Embedded quality gates status in build info
- **Public API**: `build_info.json` accessible at runtime

## Breaking Changes

**None** - This is a backward-compatible release candidate.

## Schema Contract

✅ **11-field output schema unchanged** - No modifications to backend API contract or UI types.

## Quality Gates

All v1.3.0 quality gates remain **PASS**:
- ✅ E2E tests: All `@happy` tests pass with 0 retries
- ✅ Lighthouse: All routes meet thresholds (≥90/95)
- ✅ Core Web Vitals: LCP ≤2.5s, CLS ≤0.10, TBT ≤200ms
- ✅ Accessibility: 0 serious/critical violations
- ✅ Telemetry: Schema validation passes
- ✅ Bundle size: ≤35KB gzip growth

## How to Enable Diagnostics

### Via URL Parameter

Add `?debug=1` to any URL:

```
/?debug=1
/search?debug=1
/results?debug=1&type=apn&apn=0204050712
```

### Via Help Panel

Click **"Help"** in the navigation header to access:
- Quick start guide
- Search tips
- Error glossary
- Keyboard shortcuts
- Accessibility statement link

## Files Changed

### New Files
- `SCHEMA_LOCK.json` - Frozen UI schema
- `SCHEMA_COMPAT.md` - Schema change control rules
- `TELEMETRY_CONTRACT.md` - Pinned telemetry contract
- `USER_GUIDE.md` - User documentation
- `DIAGNOSTICS.md` - Diagnostics guide
- `ACCESSIBILITY_STATEMENT.md` - Accessibility statement
- `ui/src/components/HelpPanel.jsx` - Help panel component
- `ui/src/components/DiagnosticsPanel.jsx` - Diagnostics panel component
- `ui/src/lib/buildInfo.ts` - Build info library
- `scripts/schema/freeze-ui.mjs` - Schema freeze script
- `scripts/schema/verify-ui.mjs` - Schema verification script
- `scripts/telemetry/verify-contract.mjs` - Telemetry contract verification
- `scripts/build/inject-build-info.mjs` - Build info injection script

### Modified Files
- `ui/src/components/Layout.jsx` - Added Help/Diagnostics panels
- `ui/vite.config.js` - Copy public directory
- `ui/package.json` - Version bump, new scripts
- `.github/workflows/ci.yml` - RC job (if added)

## Verification

### Schema Verification

```bash
npm run schema:verify
```

### Telemetry Contract Verification

```bash
npm run telemetry:verify [path-to-telemetry.ndjson]
```

### Build with Metadata

```bash
npm run build:rc
```

## Next Steps

1. **Test Release Candidate**: Verify all features work as expected
2. **Review Documentation**: Ensure user guide and diagnostics are clear
3. **Monitor Quality Gates**: Ensure all gates remain passing
4. **GA Release**: Proceed to v1.4.0 GA after RC validation

## Related

- `USER_GUIDE.md` - User documentation
- `DIAGNOSTICS.md` - Diagnostics guide
- `SCHEMA_COMPAT.md` - Schema change control
- `TELEMETRY_CONTRACT.md` - Telemetry contract

