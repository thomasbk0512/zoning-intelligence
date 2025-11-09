interface SkeletonProps {
  className?: string
  lines?: number
}

export default function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-4 bg-ink-100 rounded mb-2"
          style={{ width: idx === lines - 1 ? '75%' : '100%' }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 animate-pulse min-h-[200px]">
      <div className="h-6 bg-ink-100 rounded-lg w-1/3 mb-4" aria-hidden="true" />
      <div className="space-y-3">
        <div className="h-4 bg-ink-100 rounded" aria-hidden="true" />
        <div className="h-4 bg-ink-100 rounded w-5/6" aria-hidden="true" />
        <div className="h-4 bg-ink-100 rounded w-4/6" aria-hidden="true" />
      </div>
    </div>
  )
}

