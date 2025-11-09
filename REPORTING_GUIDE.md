# Parcel Report Guide

## Overview

The Parcel Report feature provides shareable, printable reports with stable permalinks and PDF export capabilities. Reports include Answer Cards with versioned citations, badges, and a disclaimer.

## Features

### Permalinks

- **Stable URLs**: Shareable links that encode minimal context
- **Privacy-safe**: No raw coordinates when APN is present
- **Token-based**: Includes a report token for validation

### Print Layout

- **Optimized for A4/Letter**: Print-friendly CSS with proper page breaks
- **Versioned Citations**: Shows code versions and publication dates
- **Badges**: Displays Overlay, Exception, and Overridden badges
- **Disclaimer**: Includes informational disclaimer and code source metadata

### PDF Export

- **CI-only**: PDF generation runs in CI using headless Chromium
- **Validated**: PDFs are validated for required content
- **Artifacted**: PDFs are uploaded as CI artifacts

## Usage

### Sharing a Report

1. **Copy Link**: Click "Share" → "Copy link" to get a permalink
2. **Print**: Click "Share" → "Print / Save as PDF" to open print dialog
3. **Browser Print**: Use browser's "Save as PDF" option

### Permalink Format

```
/results?type=apn&apn=0204050712&city=austin&zone=SF-3&token=abc123&jurisdiction=austin
```

Parameters:
- `type`: `apn` or `latlng`
- `apn`: APN (if type is `apn`)
- `lat`/`lng`: Coordinates (if type is `latlng`, only when no APN)
- `city`: City name
- `zone`: Zoning district (optional)
- `jurisdiction`: Jurisdiction ID (optional)
- `token`: Report token for validation

### Privacy Considerations

- **No coordinates in APN links**: When APN is present, coordinates are never included
- **No tracking params**: UTM and other tracking parameters are stripped
- **Minimal data**: Only essential parameters are encoded

## Print Layout

### Header

- Report title
- APN (if available)
- Zone and jurisdiction badge
- Generation timestamp and version

### Body

- Answer Cards with values, units, and citations
- Version badges (Code vYYYY.MM)
- Overlay/Exception/Overridden badges
- Conflict notices when applicable

### Footer

- Disclaimer text
- Code source versions and publication dates
- Generation timestamp

## PDF Generation (CI)

PDFs are generated in CI using:

1. **Build app**: `npm run build`
2. **Start preview server**: `npm run preview`
3. **Render PDF**: Headless Chromium loads permalink and saves PDF
4. **Validate**: Checks for required content (title, intents, citations, disclaimer)
5. **Upload artifact**: PDF saved as CI artifact

## Limitations

- **CI-only PDF**: PDF generation requires headless browser (not available in production)
- **Browser print**: Users can use browser's print-to-PDF feature
- **No server infrastructure**: All processing is client-side or CI-based

## Related

- `CITATION_MANIFEST.md` - Code versioning system
- `STALE_ANCHORS_PLAYBOOK.md` - Handling stale citations

