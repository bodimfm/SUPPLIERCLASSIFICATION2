import type React from "react"

interface ChecklistProps {
  title: string
  items: string[]
  type?: string
}

export const Checklist: React.FC<ChecklistProps> = ({ title, items, type = "basic" }) => {
  return (
    <div className="mt-4 border rounded p-4 bg-white shadow-sm">
      <h3 className="font-medium text-lg mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start">
            <input type="checkbox" id={`check-${type}-${index}`} className="mt-1 mr-2" />
            <label htmlFor={`check-${type}-${index}`} className="text-sm">
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
