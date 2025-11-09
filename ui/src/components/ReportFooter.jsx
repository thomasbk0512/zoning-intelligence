import { useEffect, useState } from 'react'
import { loadSnapshot } from '../engine/citations/snapshot'

interface ReportFooterProps {
  jurisdictionId?: string
  className?: string
}

export default function ReportFooter({ jurisdictionId = 'austin', className = '' }: ReportFooterProps) {
  const [manifestInfo, setManifestInfo] = useState<any>(null)

  useEffect(() => {
    loadSnapshot(jurisdictionId).then(snapshot => {
      if (snapshot) {
        setManifestInfo({
          version: snapshot.manifest.version,
          published_at: snapshot.manifest.published_at,
          sources: snapshot.manifest.sources,
        })
      }
    })
  }, [jurisdictionId])

  return (
    <div className={`report-footer print-keep ${className}`}>
      <div className="disclaimer">
        <p className="font-semibold mb-1">Disclaimer</p>
        <p className="text-xs">
          This report is for informational purposes only. Zoning regulations may change, and this report may not reflect the most current code provisions. Always consult with your local jurisdiction and a qualified professional for official zoning requirements and interpretations.
        </p>
      </div>
      
      {manifestInfo && (
        <div className="metadata mt-4">
          <p className="font-semibold mb-1">Code Sources</p>
          <div className="text-xs space-y-1">
            {manifestInfo.sources.map((source: any, index: number) => (
              <div key={index}>
                {source.name}: Version {manifestInfo.version} (Published: {manifestInfo.published_at})
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="metadata mt-4 text-xs text-gray-500">
        Generated: {new Date().toLocaleString()}
      </div>
    </div>
  )
}

