import { ReactNode } from 'react'

interface TabsProps {
  value: string
  onChange: (value: string) => void
  tabs: Array<{ value: string; label: string }>
  children?: ReactNode
}

export default function Tabs({ value, onChange, tabs }: TabsProps) {
  return (
    <div role="tablist" className="flex border-b border-border -mx-6 px-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-3 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 relative ${
            value === tab.value
              ? 'text-primary-600'
              : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          {tab.label}
          {value === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t" />
          )}
        </button>
      ))}
    </div>
  )
}

