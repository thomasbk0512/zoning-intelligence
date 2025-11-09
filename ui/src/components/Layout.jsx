import { Link, useLocation } from 'react-router-dom'
import { usePageViewTracking } from '../hooks/useTelemetry'
import ScopeBar from './ScopeBar'

export default function Layout({ children }) {
  const location = useLocation()
  usePageViewTracking() // Track page views on route changes
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-bg shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-semibold text-primary-600 focus-ring rounded-2"
              aria-label="Zoning Intelligence Home"
            >
              Zoning Intelligence
            </Link>
            <nav className="space-x-4" aria-label="Main navigation">
              <Link 
                to="/" 
                className={`text-sm sm:text-base transition-colors focus-ring rounded-2 ${
                  location.pathname === '/' 
                    ? 'text-primary-600 font-medium' 
                    : 'text-text-muted hover:text-primary-700'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className={`text-sm sm:text-base transition-colors focus-ring rounded-2 ${
                  location.pathname === '/search' 
                    ? 'text-primary-600 font-medium' 
                    : 'text-text-muted hover:text-primary-700'
                }`}
              >
                Search
              </Link>
            </nav>
          </div>
        </div>
        <ScopeBar />
      </header>
      
      <main className="flex-grow" role="main">
        {children}
      </main>
      
      <footer className="bg-surface border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-muted">&copy; 2024 Zoning Intelligence. v1.0.0</p>
        </div>
      </footer>
    </div>
  )
}

