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
  const baseClasses = 'px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm'
  const variantClasses = variant === 'primary' 
    ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-800 shadow-sm hover:shadow-md disabled:hover:bg-primary-600' 
    : 'bg-white text-ink-900 border border-border hover:border-primary-300 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-800 shadow-sm hover:shadow-md disabled:hover:bg-white'
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

