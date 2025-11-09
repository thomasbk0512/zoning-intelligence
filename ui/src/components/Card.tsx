import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-bg rounded-3 shadow-md p-6 border border-border ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-text">{title}</h2>
      )}
      {children}
    </div>
  )
}

