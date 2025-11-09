# Accessibility Guide

This document outlines accessibility standards, patterns, and best practices for the Zoning Intelligence UI.

## Standards

We target **WCAG 2.1 Level AA** compliance across all primary user flows (Home → Search → Results).

## Design Tokens

All UI elements use design tokens from `ui/src/design/tokens.css` to ensure consistent, accessible styling:

### Colors
- **Text**: `--color-text` (#0B1221) - ≥4.5:1 contrast on white
- **Text Muted**: `--color-text-muted` (#475467) - ≥4.5:1 contrast on white
- **Primary**: `--color-primary` (#3538CD) - Used for links, buttons, focus rings
- **Focus Ring**: `--color-focus-ring` (#3538CD) - 2px outline, 3:1 contrast

### Contrast Requirements
- **Normal text** (≤18px): ≥4.5:1 contrast ratio
- **Large text** (≥18.66px or ≥14px bold): ≥3:1 contrast ratio
- **UI components** (borders, focus rings): ≥3:1 contrast ratio

## Patterns

### Skip Links (WCAG 2.4.1)
Every page includes a "Skip to main content" link that:
- Is first in DOM order
- Visible on focus
- Targets `#main` landmark

```jsx
<a href="#main" className="skip-link">
  Skip to main content
</a>
```

### Focus Management (WCAG 2.4.3, 2.4.7)
- **Focus Visible**: All interactive elements have visible focus indicators (2px outline)
- **Focus Order**: Logical tab order (header → main → footer)
- **Focus on Route Change**: Main landmark receives focus (unless user is in form)
- **Focus on Error**: Error containers receive focus for screen reader announcements

### Form Labels (WCAG 3.3.1, 3.3.2, 3.3.3)
- Every input has an associated `<label>` with `htmlFor` matching input `id`
- Error messages use `aria-errormessage` and `aria-invalid="true"`
- Error messages include suggestions (e.g., "Example: 0204050712")
- Required fields marked with `required` attribute

### ARIA Live Regions
- **Status updates**: `aria-live="polite"` for loading/success states
- **Error alerts**: `aria-live="assertive"` for critical errors
- **Atomic updates**: `aria-atomic="true"` for complete announcements

### Landmarks (WCAG 1.3.1)
- `<header role="banner">` - Site header
- `<main role="main" id="main">` - Main content
- `<footer role="contentinfo">` - Site footer
- `<nav aria-label="Main navigation">` - Navigation regions

### Page Structure
- **One `<h1>` per page** - Page title
- **Semantic headings** - Proper h1 → h2 → h3 hierarchy
- **Definition lists** - Use `<dl>`, `<dt>`, `<dd>` for key-value pairs

### Keyboard Navigation (WCAG 2.1.1)
- All interactive elements are keyboard accessible
- No keyboard traps
- Tab order follows visual order
- Escape key closes modals/flyouts

## Do's and Don'ts

### ✅ Do
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Provide text alternatives for icons (`aria-label` or `aria-hidden="true"`)
- Use tokens for all colors (no hardcoded hex values)
- Test with keyboard-only navigation
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Provide error suggestions in validation messages
- Use `aria-current="page"` for active navigation items

### ❌ Don't
- Use `<div>` or `<span>` for buttons/links
- Remove focus outlines without providing alternatives
- Use color alone to convey information
- Create keyboard traps
- Use `tabIndex > 0` (rely on semantic order)
- Hide content with `display: none` if it should be accessible

## Testing

### Automated Tests
- **ESLint**: `npm run lint:a11y` - Static analysis with `eslint-plugin-jsx-a11y`
- **Jest-axe**: `npm run test:a11y` - Unit tests with axe-core
- **Playwright + axe**: `npm run pw:a11y` - E2E accessibility scans
- **Contrast check**: `node scripts/a11y/contrast-check.mjs` - Validates token contrast ratios

### Manual Testing
1. **Keyboard navigation**: Tab through all interactive elements
2. **Screen reader**: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS)
3. **Zoom**: Test at 400% zoom, ensure no horizontal scroll at 320px width
4. **Focus indicators**: Verify all interactive elements have visible focus rings

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

