"use client"

import type React from "react"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X } from "lucide-react"

interface SaveNotificationProps {
  show: boolean
  message: string
  onClose: () => void
  autoClose?: boolean
  autoCloseTime?: number
}

export const SaveNotification: React.FC<SaveNotificationProps> = ({
  show,
  message,
  onClose,
  autoClose = true,
  autoCloseTime = 5000,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (show && autoClose) {
      timer = setTimeout(() => {
        onClose()
      }, autoCloseTime)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [show, autoClose, autoCloseTime, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={onClose}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Fechar</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
