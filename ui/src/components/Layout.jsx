import { Link, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-bold text-primary-600 focus-ring rounded"
              aria-label="Zoning Intelligence Home"
            >
              Zoning Intelligence
            </Link>
            <nav className="space-x-4" aria-label="Main navigation">
              <Link 
                to="/" 
                className={`text-sm sm:text-base transition-colors focus-ring rounded ${
                  location.pathname === '/' 
                    ? 'text-primary-600 font-medium' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className={`text-sm sm:text-base transition-colors focus-ring rounded ${
                  location.pathname === '/search' 
                    ? 'text-primary-600 font-medium' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Search
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow" role="main">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2024 Zoning Intelligence. v1.0.0</p>
        </div>
      </footer>
    </div>
  )
}

