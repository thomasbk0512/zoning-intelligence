# UI Changelog

All notable changes to the UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Additional jurisdictions
- Map visualization
- Export functionality
- Advanced filtering

## [1.0.1-ui] - 2024-11-08

### Fixed
- Fixed API test mocking issues (P1-001)
- Added retry button on network error (P2-002)
- Improved ARIA live region announcements (P2-003)
- Added loading skeleton components (P2-001)

### Changed
- Enhanced error state with retry functionality
- Improved screen reader experience with dedicated aria-live region
- Added loading states for better UX during API calls

## [1.0.0] - 2024-11-08

### Added
- Initial UI MVP release
- React 18 + TypeScript + Vite setup
- Tailwind CSS styling
- Search by APN functionality
- Search by latitude/longitude functionality
- Results page with all 11 schema fields
- Responsive design (mobile-first)
- Accessibility features (WCAG 2.1 AA)
- Error handling and validation
- URL query parameter persistence
- Unit tests with Vitest
- CI/CD workflow

