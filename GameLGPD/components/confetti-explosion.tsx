"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { useSound } from "./sound-provider"

interface ConfettiExplosionProps {
  show: boolean
  duration?: number
}

export default function ConfettiExplosion({ show, duration = 3000 }: ConfettiExplosionProps) {
  const { width, height } = useWindowSize()
  const [isActive, setIsActive] = useState(false)
  const { playSound } = useSound()

  useEffect(() => {
    if (show) {
      setIsActive(true)
      playSound("complete")
      const timer = setTimeout(() => {
        setIsActive(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, playSound])

  if (!isActive) return null

  return <Confetti width={width} height={height} recycle={false} numberOfPieces={200} gravity={0.2} />
}

