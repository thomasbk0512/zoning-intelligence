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
          className="h-4 bg-surface rounded mb-2"
          style={{ width: idx === lines - 1 ? '75%' : '100%' }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-bg rounded-3 shadow-md p-6 border border-border animate-pulse">
      <div className="h-6 bg-surface rounded w-1/3 mb-4" aria-hidden="true" />
      <div className="space-y-3">
        <div className="h-4 bg-surface rounded" aria-hidden="true" />
        <div className="h-4 bg-surface rounded w-5/6" aria-hidden="true" />
        <div className="h-4 bg-surface rounded w-4/6" aria-hidden="true" />
      </div>
    </div>
  )
}

