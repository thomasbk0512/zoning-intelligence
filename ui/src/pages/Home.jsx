import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-text mb-4">
          Zoning Intelligence
        </h1>
        <p className="text-lg sm:text-xl text-text-muted mb-8">
          Get instant zoning information for any property
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/search">
            <Button className="text-base sm:text-lg px-6 sm:px-8 py-3">
              Search Property
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Search by APN</h3>
          <p className="text-sm sm:text-base text-text-muted">
            Enter an Assessor's Parcel Number to get detailed zoning information.
          </p>
        </Card>
        
        <Card>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Search by Location</h3>
          <p className="text-sm sm:text-base text-text-muted">
            Use latitude and longitude to find zoning for any location.
          </p>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Comprehensive Data</h3>
          <p className="text-sm sm:text-base text-text-muted">
            Get setbacks, height limits, FAR, lot coverage, and overlays.
          </p>
        </Card>
      </div>
    </div>
  )
}

