interface KeyValueProps {
  label: string
  value: string | number
  className?: string
}

export default function KeyValue({ label, value, className = '' }: KeyValueProps) {
  return (
    <div className={className}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  )
}

