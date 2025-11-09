# UX-101: Design tokens + core UI refactor (light)

This PR implements a design system with tokens and refactors core UI components to use them.

## Design Tokens

### Colors
- **Primary**: `#3538CD` (main brand color)
- **Primary Weak**: `#E5E7FF` (subtle backgrounds)
- **Text**: `#0B1221` (body text, ≥4.5:1 contrast on white)
- **Text Muted**: `#475467` (secondary text)
- **Background**: `#FFFFFF` (page background)
- **Surface**: `#F8FAFC` (card/panel backgrounds)
- **Border**: `#E5E7EB` (dividers, inputs)
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Danger**: `#EF4444`

### Typography
- **Font Family**: Plus Jakarta Sans (with system fallbacks)
- **Sizes**: 12, 14, 16, 18, 20, 24, 30, 36px
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

### Spacing & Radii
- **Spacing**: 4, 8, 12, 16, 24, 32px
- **Border Radius**: 4, 8, 12, 16px

### Shadows
- **Small**: `0 1px 2px rgba(16,24,40,0.06)`
- **Medium**: `0 4px 8px rgba(16,24,40,0.08)`

## Changes

### New Files
- `ui/src/design/tokens.json` - Raw token definitions
- `ui/src/design/tokens.css` - CSS variables (`:root`)

### Updated Files
- `ui/tailwind.config.js` - Consumes CSS variables via `theme.extend`
- `ui/src/styles/index.css` - Imports `tokens.css`, sets base body styles
- `ui/src/components/Button.tsx` - Uses token colors, radii, focus states
- `ui/src/components/Input.tsx` - Uses token colors, borders, error states
- `ui/src/components/Card.tsx` - Uses token colors, shadows, borders
- `ui/src/pages/Home.jsx` - Updated text colors to tokens
- `ui/src/pages/Search.jsx` - Updated form elements to tokens
- `ui/src/pages/Results.jsx` - Updated shell chrome to tokens (map visuals unchanged)

## Accessibility

- ✅ Focus rings: 2px, visible, not clipped
- ✅ Text contrast: Body text ≥4.5:1 on white (`#0B1221` on `#FFFFFF`)
- ✅ UI chrome contrast: ≥3:1 for interactive elements
- ✅ Keyboard navigation: All interactive elements focusable

## Verification

- ✅ No hardcoded hex colors in components (verified via grep)
- ✅ All components use CSS variables via Tailwind
- ✅ Build passes (`npm run build`)
- ✅ UI Quick Check workflow should pass

## Notes

- Light mode only (as specified)
- Map visuals unchanged (MapLibre styling preserved)
- No layout regressions (style-only refactor)

