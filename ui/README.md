# Zoning Intelligence UI

Web interface for the Zoning Intelligence CLI tool.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vitest** - Testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd ui
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` to set your API URL:

```
VITE_API_BASE_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

### Run Tests

```bash
npm run test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Quality Checks

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run typecheck
```

### Format

```bash
npm run format
```

## Project Structure

```
ui/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── lib/           # API and utilities
│   ├── styles/        # Global styles
│   └── test/          # Test setup
├── public/            # Static assets
└── docs/              # Documentation
```

## API Integration

The UI connects to the backend API. Set the API URL via environment variable:

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Features

- ✅ Search by APN
- ✅ Search by latitude/longitude
- ✅ Responsive design (mobile-first)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Error handling
- ✅ Loading states
- ✅ URL query parameter persistence

## Design Goals

- Clean, modern interface
- Responsive design (mobile-first)
- Fast, intuitive property search
- Clear presentation of zoning data
- Accessible and user-friendly
- Light mode only

