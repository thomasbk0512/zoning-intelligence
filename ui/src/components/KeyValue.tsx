interface KeyValueProps {
  label: string
  value: string | number
  className?: string
}

export default function KeyValue({ label, value, className = '' }: KeyValueProps) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-text">{value}</dd>
    </div>
  )
}

