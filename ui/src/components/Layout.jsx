import { Link, useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useRef } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  
  // Focus management on route change
  useEffect(() => {
    if (mainRef.current) {
      // Skip focus if user is interacting with form inputs
      const activeElement = document.activeElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
        return
      }
      // Focus main landmark for screen readers
      mainRef.current.focus()
    }
  }, [location.pathname])
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-bg shadow-sm border-b border-border" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-semibold text-primary focus-ring rounded-2"
              aria-label="Zoning Intelligence Home"
            >
              Zoning Intelligence
            </Link>
            <nav className="space-x-4" aria-label="Main navigation">
              <Link 
                to="/" 
                className={`text-sm sm:text-base transition-colors focus-ring rounded-2 ${
                  location.pathname === '/' 
                    ? 'text-primary font-medium' 
                    : 'text-text-muted hover:text-primary'
                }`}
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className={`text-sm sm:text-base transition-colors focus-ring rounded-2 ${
                  location.pathname === '/search' 
                    ? 'text-primary font-medium' 
                    : 'text-text-muted hover:text-primary'
                }`}
                aria-current={location.pathname === '/search' ? 'page' : undefined}
              >
                Search
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main 
        ref={mainRef}
        className="flex-grow" 
        role="main"
        tabIndex={-1}
        aria-label="Main content"
      >
        {children}
      </main>
      
      <footer className="bg-surface border-t border-border py-4" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-muted">&copy; 2024 Zoning Intelligence. v1.0.0</p>
        </div>
      </footer>
    </div>
  )
}

