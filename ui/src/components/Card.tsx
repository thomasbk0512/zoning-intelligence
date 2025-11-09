import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-border p-6 transition-shadow duration-200 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-ink-900">{title}</h2>
      )}
      {children}
    </div>
  )
}

