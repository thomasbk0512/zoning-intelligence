import { COPY } from '../copy/ui'

/**
 * ScopeBar component
 * Persistent scope indicator showing coverage area
 */
export default function ScopeBar() {
  return (
    <div 
      className="bg-primary-50 border-b border-primary-200 py-2"
      role="region"
      aria-label="Coverage area"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-primary-700 text-center">
          {COPY.scope.banner}
        </p>
      </div>
    </div>
  )
}

