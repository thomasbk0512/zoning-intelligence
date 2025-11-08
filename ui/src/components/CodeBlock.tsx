import { ReactNode } from 'react'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

export default function CodeBlock({ children, className = '' }: CodeBlockProps) {
  return (
    <pre className={`bg-gray-100 rounded-lg p-4 overflow-x-auto text-sm ${className}`}>
      <code>{children}</code>
    </pre>
  )
}

