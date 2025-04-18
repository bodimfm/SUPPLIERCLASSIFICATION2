"use client"

import type React from "react"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface ChecklistProps {
  title: string
  items: string[]
  type?: string
  checkedItems?: Record<string, boolean>
  onCheckChange?: (type: string, item: string, checked: boolean) => void
}

export const Checklist: React.FC<ChecklistProps> = ({
  title,
  items,
  type = "basic",
  checkedItems = {},
  onCheckChange,
}) => {
  const handleToggleItem = (index: number, item: string) => {
    if (onCheckChange) {
      const key = `${type}-${item}`
      const currentValue = checkedItems[key] || false
      onCheckChange(type, item, !currentValue)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 border rounded p-4 bg-white shadow-sm"
    >
      <h3 className="font-medium text-lg mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => {
          const isChecked = checkedItems[`${type}-${item}`] || false

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id={`check-${type}-${index}`}
                  checked={isChecked}
                  onChange={() => handleToggleItem(index, item)}
                  className="opacity-0 absolute h-5 w-5 cursor-pointer"
                />
                <div
                  className={`border-2 rounded h-5 w-5 flex flex-shrink-0 justify-center items-center mr-2 ${
                    isChecked ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: isChecked ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <CheckCircle size={12} className="text-white" />
                  </motion.div>
                </div>
              </div>
              <label
                htmlFor={`check-${type}-${index}`}
                className={`text-sm select-none ${isChecked ? "line-through text-gray-500" : ""}`}
              >
                {item}
              </label>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
