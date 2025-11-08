# Contributing to Zoning Intelligence UI

Thank you for your interest in contributing!

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd zoning/ui

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Development Workflow

### Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Type check: `npm run typecheck`
6. Build: `npm run build`
7. Submit a PR

### Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use Tailwind CSS for styling
- Ensure accessibility (WCAG 2.1 AA)
- Write tests for new features

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Quality Checks

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Format code
npm run format

# Build
npm run build
```

## Pull Request Process

1. Ensure all tests pass
2. Update CHANGELOG.md if needed
3. Ensure Lighthouse scores remain ≥90
4. Request review
5. Address feedback
6. Merge when approved

## Accessibility Guidelines

- All interactive elements must be keyboard accessible
- Use semantic HTML
- Provide ARIA labels where needed
- Ensure color contrast meets WCAG AA
- Test with screen readers

## Performance Guidelines

- Keep bundle size minimal
- Optimize images
- Use code splitting where appropriate
- Maintain Lighthouse score ≥90

---

**Questions?** Open an issue or contact the maintainers.

