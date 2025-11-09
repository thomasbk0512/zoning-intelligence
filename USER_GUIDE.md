# User Guide

This guide explains how to use the Zoning Intelligence web application.

## Overview

Zoning Intelligence provides instant zoning information for properties in Austin, TX. Search by APN (Assessor's Parcel Number) or location coordinates to get detailed zoning regulations.

## Getting Started

### Home Page

The home page provides an overview of the application and a quick link to start searching.

1. Click **"Search Property"** to begin
2. Or use the **"Search"** link in the navigation

### Search Page

#### Search by APN

1. Select **"APN"** tab (default)
2. Enter the Assessor's Parcel Number (e.g., `0204050712`)
3. Select city: **Austin, TX** (currently only option)
4. Click **"Search"**

#### Search by Location

1. Select **"Location (Lat/Lng)"** tab
2. Enter latitude (e.g., `30.2672`)
3. Enter longitude (e.g., `-97.7431`)
4. Select city: **Austin, TX**
5. Click **"Search"**

### Results Page

The results page displays comprehensive zoning information:

#### Property Information
- **APN**: Assessor's Parcel Number
- **Jurisdiction**: City and state
- **Zone**: Zoning designation

#### Zoning Regulations
- **Setbacks** (in feet):
  - Front
  - Side
  - Rear
  - Street Side (if applicable)
- **Limits**:
  - Height (feet)
  - FAR (Floor Area Ratio)
  - Lot Coverage (percentage)

#### Overlays
- Lists any overlay districts (e.g., Historic, Design)

#### Sources
- Data sources with citations
- Click **"View All Sources"** to see complete list

#### Map View
- Interactive map showing parcel boundaries
- Toggle parcel and zoning overlays
- Use map controls to zoom and pan

## Validation

### APN Format
- Must be numeric
- Cannot be empty

### Location Format
- Latitude: -90 to 90 (decimal degrees)
- Longitude: -180 to 180 (decimal degrees)
- Both fields required

### Error Messages
- **"APN is required"**: APN field is empty
- **"Valid latitude and longitude are required"**: Invalid coordinate format
- **"Latitude must be between -90 and 90"**: Latitude out of range
- **"Longitude must be between -180 and 180"**: Longitude out of range
- **"Property not found"**: APN or location doesn't match any parcel
- **"Network error"**: Unable to connect to server

## Deep Links

You can share direct links to results:

```
/results?type=apn&apn=0204050712&city=austin
/results?type=location&lat=30.2672&lng=-97.7431&city=austin
```

The application will automatically fetch and display results.

## Keyboard Navigation

- **Tab**: Navigate between elements
- **Enter**: Submit form or activate button
- **Esc**: Close dialogs and panels
- **Ctrl/Cmd + P**: Print results

## Printing

Click the **"Print"** button on the results page to generate a print-friendly summary.

## Help

Click **"Help"** in the navigation to access:
- Quick start guide
- Search tips
- Error glossary
- Keyboard shortcuts
- Accessibility information

## Diagnostics

Access diagnostics panel via:
- URL parameter: `?debug=1` (e.g., `/?debug=1`)
- Or programmatically via browser console

Diagnostics show:
- Build information (version, git SHA, build time)
- Quality gates status
- Feature flags
- Web Vitals metrics

## Troubleshooting

### No Results Found

- Verify APN is correct
- Check coordinates are valid
- Ensure property is in Austin, TX

### Network Errors

- Check internet connection
- Try again after a few moments
- Contact support if issue persists

### Map Not Loading

- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

## Support

For issues or questions:
1. Check the **Help** panel
2. Review **Diagnostics** (via `?debug=1`)
3. Copy diagnostics information when reporting bugs

## Related

- `ACCESSIBILITY_STATEMENT.md` - Accessibility information
- `DIAGNOSTICS.md` - Diagnostics guide

