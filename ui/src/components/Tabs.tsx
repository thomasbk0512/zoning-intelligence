import { ReactNode } from 'react'

interface TabsProps {
  value: string
  onChange: (value: string) => void
  tabs: Array<{ value: string; label: string }>
  children?: ReactNode
}

export default function Tabs({ value, onChange, tabs }: TabsProps) {
  return (
    <div role="tablist" className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 font-medium text-sm transition-colors focus-ring ${
            value === tab.value
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

