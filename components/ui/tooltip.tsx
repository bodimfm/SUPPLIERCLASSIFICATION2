"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type TooltipPosition = "top" | "bottom" | "left" | "right"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: TooltipPosition
  delay?: number
  className?: string
  contentClassName?: string
  maxWidth?: string
  disabled?: boolean
}

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  className,
  contentClassName,
  maxWidth = "250px",
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsMounted(true)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (disabled) return
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsVisible(false)
  }

  const handleFocus = () => {
    if (disabled) return
    setIsVisible(true)
  }

  const handleBlur = () => {
    setIsVisible(false)
  }

  // Calculate position styles based on the position prop
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
        }
      case "bottom":
        return {
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "8px",
        }
      case "left":
        return {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: "8px",
        }
      case "right":
        return {
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: "8px",
        }
      default:
        return {}
    }
  }

  // Animation variants based on position
  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      ...(position === "top" && { y: 10 }),
      ...(position === "bottom" && { y: -10 }),
      ...(position === "left" && { x: 10 }),
      ...(position === "right" && { x: -10 }),
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  }

  if (!isMounted) return <>{children}</>

  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <div
            className={cn("relative inline-block", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={triggerRef}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={position}>
          <AnimatePresence>
            {isVisible && (
              <motion.div
                ref={tooltipRef}
                className={cn("absolute z-50 px-3 py-2 text-sm bg-navy text-white rounded shadow-lg", contentClassName)}
                style={{
                  ...getPositionStyles(),
                  maxWidth,
                }}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="tooltip"
              >
                {content}
                <div
                  className={cn(
                    "absolute w-2 h-2 bg-navy rotate-45",
                    position === "top" && "bottom-0 left-1/2 -mb-1 -translate-x-1/2",
                    position === "bottom" && "top-0 left-1/2 -mt-1 -translate-x-1/2",
                    position === "left" && "right-0 top-1/2 -mr-1 -translate-y-1/2",
                    position === "right" && "left-0 top-1/2 -ml-1 -translate-y-1/2",
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export const TooltipRoot = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

interface TooltipContentProps {
  side?: TooltipPosition
  children: React.ReactNode
}

export const TooltipContent = ({ side = "top", children }: TooltipContentProps) => {
  return <>{children}</>
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}
