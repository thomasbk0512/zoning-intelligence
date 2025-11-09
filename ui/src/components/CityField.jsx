import { COPY } from '../copy/ui'

/**
 * City field component
 * Renders static Austin line or dropdown when multi-jurisdiction is enabled
 */
export default function CityField({ value = 'austin', onChange, multiJurisdiction = false }) {
  if (!multiJurisdiction) {
    // Static scope line when only Austin is available
    return (
      <div className="text-sm text-ink-700 border-t border-border pt-4 mt-4">
        {COPY.search.coverageLine}
      </div>
    )
  }

  // Dropdown when multiple jurisdictions are available
  return (
    <div>
      <label htmlFor="city" className="block text-sm font-medium text-text mb-2">
        {COPY.search.cityLabel} <span className="text-xs text-text-muted font-normal">{COPY.search.cityOptional}</span>
      </label>
      <select
        id="city"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-2 border border-border rounded-2 bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="austin">{COPY.city.austin}</option>
      </select>
    </div>
  )
}

