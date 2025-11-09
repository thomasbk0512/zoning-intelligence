# Diagnostics Guide

This guide explains the diagnostics panel and how to use it for troubleshooting.

## Accessing Diagnostics

### Via URL Parameter

Add `?debug=1` to any URL:

```
/?debug=1
/search?debug=1
/results?debug=1&type=apn&apn=0204050712
```

The diagnostics panel will open automatically.

### Via Browser Console

```javascript
// Open diagnostics
window.__openDiagnostics?.()

// Or manually trigger
// (Implementation depends on component structure)
```

## Diagnostics Information

### Build Information

- **Version**: Application version (e.g., `v1.4.0-rc.1`)
- **Git SHA**: Git commit hash (first 7 characters)
- **Build Time**: ISO timestamp of build
- **CI Run**: Link to CI workflow run (if available)

### Quality Gates

Shows status of quality gates from the build:
- **Verdict**: PASS or FAIL
- **E2E Tests**: Pass/fail status
- **Lighthouse**: Pass/fail status
- **Telemetry**: Schema validation status

### Feature Flags

Current state of feature flags:
- **E2E Enabled**: Whether E2E tests are enabled
- **Lighthouse Enabled**: Whether Lighthouse CI is enabled
- **Telemetry Enabled**: Whether telemetry is enabled

### Web Vitals

Note that Web Vitals metrics are collected via telemetry. Check browser console for recent values.

## Copying Diagnostics

Click **"Copy to Clipboard"** to copy:
- Build information
- User agent
- Current URL
- Timestamp

Use this information when reporting bugs or issues.

## Using Diagnostics for Bug Reports

When reporting bugs, include:

1. **Diagnostics Information**:
   - Copy from diagnostics panel
   - Includes version, build info, feature flags

2. **Browser Information**:
   - User agent (included in copied diagnostics)
   - Browser version
   - Operating system

3. **Steps to Reproduce**:
   - What you were doing
   - What you expected
   - What actually happened

4. **Console Errors**:
   - Open browser DevTools
   - Check Console tab for errors
   - Include relevant error messages

5. **Network Issues**:
   - Check Network tab in DevTools
   - Note any failed requests
   - Include request/response details (if safe)

## Privacy Note

Diagnostics information does **not** include:
- Personal information
- Search queries
- APNs or coordinates
- User identifiers

All information is safe to share in bug reports.

## Related

- `USER_GUIDE.md` - User guide
- `ACCESSIBILITY_STATEMENT.md` - Accessibility information

