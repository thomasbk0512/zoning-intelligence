# v1.6.x Preview Guide

## Quick Start

Get the interactive preview running in 5 minutes:

```bash
cd ui
cp .env.preview .env
npm ci
npm run preview:dev
```

In another terminal:

```bash
cd ui
npm run preview:open
```

This will print deep links and copy the first one to your clipboard.

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `VITE_ANSWERS_ENABLE` | `true` | Enable Answer Cards feature |
| `VITE_ANSWERS_STUB` | `0` | Use real rules (0) or stubbed fixtures (1) |
| `VITE_TELEM_ENABLE` | `true` | Enable telemetry collection |
| `VITE_TELEM_TRANSPORT` | `console` | Telemetry transport: `console`, `http`, or `none` |
| `VITE_PREVIEW_BUILD` | `true` | Enable preview build mode (debug info) |

## Deep Links

### 1. Austin SF-3 (Standard)
```
http://localhost:5173/results?type=apn&apn=0204050712&city=austin
```
**Expected UI:**
- ✅ Answer Cards for all 6 intents
- ✅ Citations with version badges
- ✅ "Explain" button on each card
- ✅ "View Code" button

### 2. Travis County ETJ
```
http://localhost:5173/results?type=apn&apn=ETJ_DEMO_SF3&city=austin
```
**Expected UI:**
- ✅ Jurisdiction badge: "Travis County ETJ"
- ✅ ETJ-specific Answer Cards
- ✅ ETJ code citations

### 3. NLQ Router (High Confidence)
```
http://localhost:5173/search?type=nlq&q=How%20tall%20can%20I%20build%20in%20SF-3%20APN%200204050712
```
**Expected UI:**
- ✅ Intent chip: "Max Height"
- ✅ Routes directly to Results (confidence ≥0.7 + APN present)
- ✅ Answer Cards render for max_height intent

### 4. Overlay Conflict Demo
```
http://localhost:5173/results?type=apn&apn=OVERLAY_CONFLICT_DEMO&city=austin
```
**Expected UI:**
- ✅ Overlay badge on affected Answer Cards
- ✅ Conflict notice if conflicts detected
- ✅ Trace shows overlay steps

## Testing Checklist

### Answer Cards
- [ ] All 6 intents display (front_setback, side_setback, rear_setback, max_height, lot_coverage, min_lot_size)
- [ ] Values and units render correctly
- [ ] Citations show version badges (e.g., "Code v2025.01")
- [ ] Badges appear (Overlay, Exception, Overridden) when applicable

### Explain / Trace
- [ ] Click "Explain" button → Trace modal opens
- [ ] Modal shows ordered steps (rule → overlay → exception → override)
- [ ] Mathematical expressions display correctly (e.g., "prev + 5")
- [ ] Citations link to Code modal
- [ ] "Copy as JSON" works
- [ ] "Copy as Markdown" works
- [ ] Keyboard navigation works (Tab, Esc to close)

### Share / Report
- [ ] Click "Share" → Share menu appears
- [ ] "Copy link" creates permalink
- [ ] "Print" opens print dialog
- [ ] Print view shows Answer Cards, citations, disclaimer
- [ ] Permalink opens correctly in new tab

### NLQ Router
- [ ] Type query in NLQ input → Intent chip appears
- [ ] High confidence (≥0.7) + APN → Routes to Results
- [ ] Low confidence → Shows ParsePreview for confirmation
- [ ] Ambiguous query → Shows disambiguation options

### Telemetry
- [ ] Open browser console
- [ ] Verify events logged (no raw PII):
  - `intent_detected`
  - `answer_render`
  - `trace_opened`
  - `trace_copied`
  - `report_shared`
- [ ] Events include required fields (intent, confidence, mode, etc.)

### Accessibility
- [ ] Keyboard navigation works (Tab through all interactive elements)
- [ ] Focus rings visible
- [ ] ARIA labels present
- [ ] Screen reader announces state changes
- [ ] Modal focus trap works

### Performance
- [ ] Page loads in <3s
- [ ] Answer Cards render without layout shift
- [ ] No console errors
- [ ] Lighthouse scores ≥90 (run locally)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Empty Cache / Hard Reload
- Chrome/Edge: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Firefox: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)

### Answers Not Showing
1. Check browser console for errors
2. Verify `VITE_ANSWERS_ENABLE=true` in `.env`
3. Check network tab for API calls (if not stubbed)
4. Verify golden fixtures exist in `ui/public/engine/answers/`

### Telemetry Not Logging
1. Verify `VITE_TELEM_ENABLE=true` in `.env`
2. Check `VITE_TELEM_TRANSPORT=console`
3. Open browser console and look for `__telem_track` calls

### NLQ Not Routing
1. Verify query includes APN or coordinates
2. Check confidence score in console (should be ≥0.7)
3. Verify intent is detected (check IntentChip)

## Environment Setup

### Local Preview (Default)
```bash
cp .env.preview .env
npm run preview:dev
```

### CI/Testing (Stubbed)
```bash
# .env
VITE_ANSWERS_ENABLE=true
VITE_ANSWERS_STUB=1
VITE_TELEM_ENABLE=true
VITE_TELEM_TRANSPORT=console
```

## Next Steps

After verifying the preview:
1. Test all deep links
2. Verify telemetry events
3. Check accessibility with keyboard navigation
4. Run Lighthouse audit locally
5. Test print/PDF export (CI-only)

## Related

- `ANSWERS_README.md` - Answer Cards system
- `TRACE_README.md` - Explanation traces
- `NLU_ROUTER_README.md` - Natural language query routing
- `REPORTING_GUIDE.md` - Shareable reports

