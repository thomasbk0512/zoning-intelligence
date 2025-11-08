# Lighthouse Audit Guide

## Running Lighthouse

### Chrome DevTools
1. Open the app in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Select categories: Performance, Accessibility, Best Practices, SEO
5. Click "Analyze page load"

### CLI
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

### CI Integration
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun
```

## Target Scores

- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥90

## Common Issues & Fixes

### Performance
- **Large bundle size**: Code splitting, lazy loading
- **Slow images**: Optimize images, use WebP
- **Render-blocking resources**: Defer non-critical CSS/JS
- **Unused CSS**: Purge unused Tailwind classes

### Accessibility
- **Missing alt text**: Add descriptive alt attributes
- **Low contrast**: Adjust color values
- **Missing labels**: Add proper form labels
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible

### Best Practices
- **HTTPS**: Use HTTPS in production
- **Console errors**: Fix all console errors
- **Deprecated APIs**: Update to modern APIs
- **Security headers**: Configure proper headers

## Audit Checklist

- [ ] Home page: All scores ≥90
- [ ] Search page: All scores ≥90
- [ ] Results page: All scores ≥90
- [ ] Mobile view: All scores ≥90
- [ ] Desktop view: All scores ≥90

---

**Last Updated**: 2024-11-08

