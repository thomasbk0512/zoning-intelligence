import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import { SkeletonCard } from './components/Skeleton'

// Lazy load routes for code splitting
const Search = lazy(() => import('./pages/Search'))
const Results = lazy(() => import('./pages/Results'))
const Print = lazy(() => import('./pages/Print'))

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/search" 
            element={
              <Suspense fallback={
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                  <SkeletonCard />
                </div>
              }>
                <Search />
              </Suspense>
            } 
          />
          <Route 
            path="/results" 
            element={
              <Suspense fallback={
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                  <div className="space-y-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
              }>
                <Results />
              </Suspense>
            } 
          />
          <Route 
            path="/print" 
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Print />
              </Suspense>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

