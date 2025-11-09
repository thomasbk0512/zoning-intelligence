# Lighthouse Performance Guide

This document outlines Lighthouse CI configuration, performance targets, and optimization strategies.

## Overview

Lighthouse CI runs on every CI build (when `LH_ENABLE=true`) and audits three primary routes:
- `/` - Home page
- `/search` - Search page
- `/results` - Results page

## Targets

### Category Scores (Mobile Emulation)
- **Performance**: ≥90
- **Accessibility**: ≥95 (from UX-103)
- **Best Practices**: ≥90
- **SEO**: ≥90

### Core Web Vitals
- **LCP** (Largest Contentful Paint): ≤2.5s
- **CLS** (Cumulative Layout Shift): ≤0.10
- **TBT** (Total Blocking Time): ≤200ms
- **FCP** (First Contentful Paint): ≤2.0s
- **Speed Index**: ≤3.4s
- **TTI** (Time to Interactive): ≤3.8s

## Running Locally

### Prerequisites
```bash
npm install -g @lhci/cli
```

### Build and Serve
```bash
cd ui
npm run build
npm run preview
# Server runs on http://localhost:4173
```

### Run Lighthouse CI
```bash
cd ui
lhci autorun
```

### Run Single Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4173/ --view
```

## Performance Optimizations

### Code Splitting
- Routes are lazy-loaded using `React.lazy()` and `Suspense`
- Vendor chunks separated: `react-vendor`, `map-vendor`
- CSS code splitting enabled

### Asset Optimization
- **Preconnect**: API origin preconnected in `<head>`
- **Preload**: Critical fonts preloaded with `font-display: swap`
- **Font Loading**: Google Fonts loaded asynchronously with fallback

### Layout Stability (CLS)
- Explicit dimensions on skeletons (`minHeight`, `width`)
- Map container has fixed height (`384px`) and aspect ratio
- Skeleton cards have `minHeight` to prevent layout shifts

### JavaScript Optimization
- **TBT Reduction**: API calls deferred with `requestIdleCallback`
- **Tree Shaking**: Unused code eliminated via Vite
- **Minification**: Terser with console/debugger removal
- **Source Maps**: Disabled in production

### CSS Optimization
- Critical CSS inlined
- Dead code elimination via Tailwind purge
- Token-based styling (no heavy shadows/filters)

## Bundle Size Budgets

- **Total gzip growth**: ≤35KB vs previous main build
- **Script chunks**: Monitored via Lighthouse resource summary
- **Image assets**: Optimized, prefer SVG inline

## Common Fixes

### Performance < 90
1. **Check bundle size**: Run `npm run build` and inspect `dist/` size
2. **Reduce JavaScript**: Remove unused dependencies, lazy load heavy modules
3. **Optimize images**: Use WebP, set explicit dimensions
4. **Reduce render-blocking**: Move non-critical CSS, defer scripts
5. **Improve caching**: Add cache headers for static assets

### CLS > 0.10
1. **Add dimensions**: Set `width` and `height` on images/icons
2. **Reserve space**: Use `minHeight` on dynamic content containers
3. **Avoid late-loading fonts**: Use `font-display: swap`
4. **Stable layouts**: Avoid inserting content above existing content

### TBT > 200ms
1. **Defer non-critical work**: Use `requestIdleCallback` for API calls
2. **Split long tasks**: Break up heavy computations
3. **Reduce JavaScript**: Remove unused code, optimize bundles
4. **Avoid blocking**: Don't block main thread during initial render

### SEO < 90
1. **Meta tags**: Ensure `<title>`, `<meta name="description">` present
2. **Canonical URL**: Add `<link rel="canonical">` to `<head>`
3. **Language**: Set `lang` attribute on `<html>`
4. **Viewport**: Ensure responsive viewport meta tag
5. **HTTPS**: All resources must use HTTPS

### Best Practices < 90
1. **HTTPS**: Ensure all resources use HTTPS
2. **Console errors**: Fix any console errors/warnings
3. **Deprecated APIs**: Remove deprecated browser APIs
4. **Image optimization**: Use modern formats (WebP), proper sizing
5. **Security headers**: Ensure proper security headers

## CI Artifacts

Lighthouse reports are uploaded as CI artifacts:
- **Location**: `.lighthouseci/` directory
- **Formats**: HTML reports and JSON summaries
- **Retention**: 7 days
- **Access**: GitHub Actions → Artifacts → `lighthouse-reports`

## Configuration

See `ui/lighthouserc.json` for:
- Collection settings (mobile emulation, throttling)
- Assertion thresholds (category scores, CWV)
- Upload configuration (filesystem output)

## Monitoring

- **CI**: Lighthouse runs on every PR and main branch push
- **Reports**: View HTML reports in CI artifacts
- **Trends**: Monitor score trends over time
- **Alerts**: CI fails if thresholds not met

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)

