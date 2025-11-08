import { ReactNode } from 'react'

interface TabsProps {
  value: string
  onChange: (value: string) => void
  tabs: Array<{ value: string; label: string }>
  children?: ReactNode
}

export default function Tabs({ value, onChange, tabs }: TabsProps) {
  return (
    <div role="tablist" className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            value === tab.value
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

