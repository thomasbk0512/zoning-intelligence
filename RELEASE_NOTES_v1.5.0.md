# Release Notes v1.5.0

## General Availability (GA) Release

This is the first general availability (GA) release of Zoning Intelligence, cut from release candidate v1.4.0-rc.1.

## Highlights

### Production Ready
- **Stable API Contract**: 11-field output schema frozen and verified
- **Telemetry Contract**: Event schema version 1.0.0 pinned
- **Quality Gates**: All thresholds met and verified
- **Documentation**: Comprehensive user guide, diagnostics, and accessibility statement

### In-App Help & Diagnostics
- **Help Panel**: Accessible help with quick start, search tips, error glossary, keyboard shortcuts
- **Diagnostics Panel**: Build information, quality gates status, feature flags, Web Vitals
- **Accessible**: Focus trap, ARIA modal, keyboard navigation (Esc to close)
- **Discoverable**: Help button in header, diagnostics via `?debug=1` parameter

### Quality Assurance
- **E2E Tests**: All `@happy` tests pass with 0 retries
- **Lighthouse**: All routes meet thresholds (Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO ≥90)
- **Core Web Vitals**: LCP ≤2.5s, CLS ≤0.10, TBT ≤200ms
- **Accessibility**: 0 serious/critical violations, WCAG 2.1 AA compliant
- **Telemetry**: Schema validation passes
- **Bundle Size**: ≤35KB gzip growth

## Breaking Changes

**None** - This is a backward-compatible GA release.

## Schema Contract

✅ **11-field output schema unchanged** - No modifications to backend API contract or UI types.

**Frozen Schema**: `SCHEMA_LOCK.json` (SHA256: `9bf11c5665cd948eb8b7f51d3b69bf749ff5917a2d64066007f9ad1875e71b54`)

**Telemetry Contract**: Event schema version 1.0.0 pinned

## What's New Since RC

- Final polish and documentation
- Production-ready build process
- Comprehensive support documentation
- Security policy and third-party notices

## Documentation

- **[User Guide](USER_GUIDE.md)**: Comprehensive guide covering all features and workflows
- **[Diagnostics Guide](DIAGNOSTICS.md)**: How to access and use diagnostics for troubleshooting
- **[Accessibility Statement](ACCESSIBILITY_STATEMENT.md)**: WCAG 2.1 AA compliance statement
- **[Support](SUPPORT.md)**: Support resources and contact information
- **[Security Policy](SECURITY.md)**: Security reporting and disclosure policy
- **[Third-Party Notices](THIRD_PARTY_NOTICES.md)**: Third-party software acknowledgments

## Installation

### Web Application

The web application is available at: [https://zoning-intelligence.app](https://zoning-intelligence.app)

### CLI

```bash
pip install zoning-intelligence
```

## Usage

### Search by APN

1. Navigate to the Search page
2. Enter the Assessor's Parcel Number (e.g., `0204050712`)
3. Select city: **Austin, TX**
4. Click **"Search"**

### Search by Location

1. Navigate to the Search page
2. Select **"Location (Lat/Lng)"** tab
3. Enter latitude and longitude (e.g., `30.2672`, `-97.7431`)
4. Select city: **Austin, TX**
5. Click **"Search"**

### Access Help

Click **"Help"** in the navigation header to access:
- Quick start guide
- Search tips
- Error glossary
- Keyboard shortcuts
- Accessibility information

### Access Diagnostics

Add `?debug=1` to any URL to open the diagnostics panel:
- Build information
- Quality gates status
- Feature flags
- Web Vitals metrics

## Quality Metrics

### Performance
- **Lighthouse Performance**: ≥90 (mobile)
- **LCP**: ≤2.5s
- **CLS**: ≤0.10
- **TBT**: ≤200ms

### Accessibility
- **Lighthouse Accessibility**: ≥95 (mobile)
- **WCAG 2.1 AA**: Compliant
- **Keyboard Navigation**: Fully supported
- **Screen Reader**: ARIA labels and live regions

### Reliability
- **E2E Tests**: All `@happy` tests pass
- **Test Retries**: 0 (tests pass on first attempt)
- **Error Handling**: Comprehensive error messages and recovery

## Known Issues

None at this time. Please report issues via the diagnostics panel or support channels.

## Support

- **Documentation**: See [USER_GUIDE.md](USER_GUIDE.md) and [DIAGNOSTICS.md](DIAGNOSTICS.md)
- **Accessibility**: See [ACCESSIBILITY_STATEMENT.md](ACCESSIBILITY_STATEMENT.md)
- **Security**: See [SECURITY.md](SECURITY.md)
- **Support**: See [SUPPORT.md](SUPPORT.md)

## Changelog

### v1.5.0 (GA)
- GA release cut from v1.4.0-rc.1
- Final polish and documentation
- Production-ready build process
- Support and security documentation

### v1.4.0-rc.1 (RC)
- Schema freeze (11-field UI contract)
- Telemetry contract pinned (version 1.0.0)
- In-app Help and Diagnostics panels
- Comprehensive documentation

### v1.3.0
- Quality gates made blocking
- E2E, Lighthouse, and Telemetry validation
- Single authoritative pass/fail verdict

## Credits

Built with:
- React 18
- Vite
- Tailwind CSS
- MapLibre GL JS
- Playwright
- Lighthouse CI

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for complete acknowledgments.

## License

[License information]

---

**Release Date**: 2025-11-09  
**Version**: v1.5.0  
**Git Tag**: `v1.5.0`

