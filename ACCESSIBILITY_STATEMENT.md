# Accessibility Statement

Zoning Intelligence is committed to ensuring digital accessibility for people with disabilities.

## Standards

This application aims to conform to **WCAG 2.1 Level AA** standards.

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order throughout the application
- Keyboard shortcuts for common actions
- Focus indicators visible on all focusable elements

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and roles where appropriate
- ARIA live regions for dynamic content
- Descriptive link and button text

### Visual Accessibility
- Color contrast meets WCAG 2.1 AA standards (4.5:1 for text, 3:1 for UI)
- Text is resizable up to 200% without loss of functionality
- No reliance on color alone to convey information
- Focus indicators are clearly visible

### Forms
- Labels associated with all form inputs
- Error messages linked to inputs via `aria-describedby`
- Required fields clearly indicated
- Validation errors announced via ARIA live regions

## Known Issues

We are actively working to address any accessibility issues. If you encounter an accessibility barrier, please report it using the diagnostics panel (`?debug=1`) and include:

- Description of the issue
- Steps to reproduce
- Browser and assistive technology used

## Testing

Accessibility is tested via:
- Automated testing (ESLint a11y rules, Jest-axe, Playwright a11y audits)
- Manual keyboard navigation testing
- Screen reader testing
- Contrast checking

## Feedback

We welcome feedback on accessibility. Please use the Help panel or diagnostics to report issues.

## Related

- `USER_GUIDE.md` - User guide with keyboard shortcuts
- `DIAGNOSTICS.md` - Diagnostics guide

