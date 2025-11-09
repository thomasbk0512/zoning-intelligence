import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { getAnswersForZone } from '../engine/answers/rules'
import { loadOverrides, mergeWithOverrides } from '../engine/answers/merge'

export default function AdminOverrides() {
  const [searchParams] = useSearchParams()
  const isAdmin = searchParams.get('admin') === '1'
  const [overrides, setOverrides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState('SF-3')

  useEffect(() => {
    if (isAdmin) {
      loadOverrides().then(setOverrides).finally(() => setLoading(false))
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <p className="text-center text-gray-600">
            Admin access required. Add <code className="bg-gray-100 px-2 py-1 rounded">?admin=1</code> to the URL.
          </p>
        </Card>
      </div>
    )
  }

  const zones = ['SF-1', 'SF-2', 'SF-3']
  const intents = ['front_setback', 'side_setback', 'rear_setback', 'max_height', 'lot_coverage', 'min_lot_size']

  const rulesAnswers = getAnswersForZone(selectedZone)
  const answersWithOverrides = rulesAnswers.map(answer => mergeWithOverrides(answer, overrides))

  const getOverrideForAnswer = (answer: any) => {
    return overrides.find(
      o => o.district === selectedZone && o.intent === answer.intent
    )
  }

  const copyOverrideAsJSON = (override: any) => {
    const json = JSON.stringify(override, null, 2)
    navigator.clipboard.writeText(json)
    alert('Override JSON copied to clipboard!')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Admin: Overrides Management</h1>
        <p className="text-sm text-gray-600 mt-2">
          Compare rules vs overrides. Copy verified overrides as JSON to add to <code>engine/answers/overrides.json</code>.
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="zone-select" className="block text-sm font-medium mb-2">
          Zone
        </label>
        <select
          id="zone-select"
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus-ring"
        >
          {zones.map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading overrides...</p>
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Overrides Summary</h2>
              <p className="text-sm text-gray-600">
                Total: {overrides.length} override(s)
              </p>
            </div>
          </Card>

          <div className="space-y-4">
            {answersWithOverrides.map((answer, index) => {
              const override = getOverrideForAnswer(answer)
              const isOverridden = answer.provenance === 'override'
              const ruleAnswer = rulesAnswers[index]

              return (
                <Card key={answer.intent}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {answer.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      {isOverridden && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Overridden
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600 mb-1">Rule Value</p>
                        <p className="text-lg">
                          {ruleAnswer.value} {ruleAnswer.unit}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {ruleAnswer.citations[0]?.section}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600 mb-1">
                          {isOverridden ? 'Override Value' : 'No Override'}
                        </p>
                        {isOverridden ? (
                          <>
                            <p className="text-lg">
                              {answer.value} {answer.unit}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {answer.citations[0]?.section}
                            </p>
                            {override && (
                              <Button
                                variant="secondary"
                                onClick={() => copyOverrideAsJSON(override)}
                                className="mt-2 text-xs"
                              >
                                Copy as JSON
                              </Button>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-400">—</p>
                        )}
                      </div>
                    </div>

                    {isOverridden && override && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <strong>Rationale:</strong> {override.rationale}
                        </p>
                        {override.expires && (
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>Expires:</strong> {override.expires}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

