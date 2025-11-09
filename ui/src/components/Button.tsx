import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-2 font-medium transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClasses = variant === 'primary' 
    ? 'bg-primary text-bg hover:opacity-90' 
    : 'bg-surface text-text border border-border hover:bg-primary-weak'
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

