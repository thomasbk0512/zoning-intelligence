# UI v1.0.0 MVP QA Checklist

**Status**: Ready for QA Review

---

## Build & Deployment

- [ ] `npm run build` completes without errors
- [ ] `npm run preview` serves valid pages
- [ ] Production build size is reasonable
- [ ] No console errors in production build

## Functionality

### Search Flow
- [ ] Home page loads correctly
- [ ] Search page accessible from home
- [ ] APN search works (e.g., 0204050712)
- [ ] Location search works (lat/lng)
- [ ] Search validation works (empty fields, invalid ranges)
- [ ] URL query params persist search state
- [ ] Results page displays all 11 schema fields
- [ ] "New Search" button navigates correctly

### API Integration
- [ ] API calls succeed (200 status)
- [ ] Response JSON matches schema
- [ ] Network errors handled gracefully
- [ ] Timeout errors handled (60s)
- [ ] 404 errors show helpful message
- [ ] 5xx errors show helpful message
- [ ] Loading states display during API calls

## Responsive Design

### Mobile (< 640px)
- [ ] Layout adapts correctly
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Forms are usable
- [ ] Navigation works

### Tablet (640px - 1024px)
- [ ] Layout adapts correctly
- [ ] Grid layouts work
- [ ] Cards display properly

### Desktop (> 1024px)
- [ ] Layout uses full width appropriately
- [ ] Max-width constraints work
- [ ] Spacing is appropriate

## Accessibility

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] ARIA labels present where needed
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatible
- [ ] Reduced motion respected

## Performance

### Lighthouse Targets
- [ ] Performance: ≥90
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

### Metrics
- [ ] First Contentful Paint: < 1.8s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Time to Interactive: < 3.8s
- [ ] Cumulative Layout Shift: < 0.1

## Testing

- [ ] All unit tests pass (`npm run test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Documentation

- [ ] README.md is complete
- [ ] .env.example is provided
- [ ] API integration documented
- [ ] Build instructions clear

---

## Known Issues

_List any known issues or limitations here_

---

## QA Notes

_Add QA findings and notes here_

---

**Last Updated**: 2024-11-08

