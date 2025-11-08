# Design Goals

## Screens

### 1. Home Page
- Hero section with search CTA
- Feature highlights
- Quick access to search

### 2. Search Page
- APN search form
- Location (lat/lng) search form
- City selector
- Clear, intuitive input fields

### 3. Results Page
- Property information display
- Zoning regulations (setbacks, height, FAR, coverage)
- Overlays list
- Sources and citations
- Performance metrics (run time)

## User Flow

1. **Landing** → Home page
2. **Search** → Enter APN or coordinates
3. **Results** → View zoning information
4. **Return** → Back to search for new property

## Framework Choice

**React + Tailwind CSS**

- React: Component-based, widely adopted
- Tailwind: Utility-first CSS, fast development
- Vite: Fast build tool, excellent DX
- React Router: Client-side routing

## Design Principles

- **Simplicity**: Clean, uncluttered interface
- **Clarity**: Clear presentation of zoning data
- **Speed**: Fast search and results display
- **Responsive**: Works on mobile and desktop
- **Accessible**: WCAG 2.1 AA compliance

## Milestones

### v1.0.0 UI
- [x] Project setup
- [ ] API integration
- [ ] Search functionality
- [ ] Results display
- [ ] Responsive design
- [ ] Basic styling

