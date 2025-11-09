import Button from './Button'
import { COPY } from '../copy/ui'

/**
 * EmptyState component
 * Beautiful empty states with clear CTAs (Linear/Stripe pattern)
 */
export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  className = '' 
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="mb-6 flex justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-ink-900 mb-2">{title}</h3>
      {description && (
        <p className="text-ink-700 mb-8 max-w-md mx-auto">{description}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && actionLabel && (
          <Button onClick={action} className="px-6">
            {actionLabel}
          </Button>
        )}
        {secondaryAction && secondaryActionLabel && (
          <Button variant="secondary" onClick={secondaryAction} className="px-6">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

