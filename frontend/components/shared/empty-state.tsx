'use client'

import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="max-w-sm text-center text-sm text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
