export default function JurisdictionBadge({ jurisdiction }) {
  if (!jurisdiction) {
    return null
  }

  return (
    <span
      className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
      title={`Jurisdiction: ${jurisdiction.name}`}
    >
      {jurisdiction.name}
    </span>
  )
}

