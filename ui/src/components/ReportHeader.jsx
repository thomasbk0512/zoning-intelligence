import { useEffect, useState } from 'react'
import JurisdictionBadge from './JurisdictionBadge'
import { getJurisdictionById } from '../engine/juris/resolve'
import { getBuildInfo } from '../lib/buildInfo'

interface ReportHeaderProps {
  apn?: string
  jurisdiction: string
  zone: string
  className?: string
}

export default function ReportHeader({ apn, jurisdiction, zone, className = '' }: ReportHeaderProps) {
  const [jurisInfo, setJurisInfo] = useState<any>(null)
  const [buildInfo, setBuildInfo] = useState<any>(null)

  useEffect(() => {
    // Load jurisdiction info
    const jurisdictionId = jurisdiction.toLowerCase().includes('travis') ? 'travis_etj' : 'austin'
    getJurisdictionById(jurisdictionId).then(setJurisInfo)
    
    // Load build info
    getBuildInfo().then(setBuildInfo).catch(() => setBuildInfo(null))
  }, [jurisdiction])

  return (
    <div className={`report-header print-keep ${className}`}>
      <h1>Zoning Parcel Report</h1>
      <div className="metadata space-y-1">
        {apn && (
          <div>
            <span className="font-semibold">APN:</span> {apn}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-semibold">Zone:</span> {zone}
          {jurisInfo && <JurisdictionBadge jurisdiction={jurisInfo} />}
        </div>
        {buildInfo && (
          <div className="text-xs text-gray-600">
            Generated: {new Date().toLocaleString()} | Version: {buildInfo.version || 'Unknown'}
          </div>
        )}
      </div>
    </div>
  )
}

