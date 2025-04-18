"use client"

import { useEffect } from "react"
import { useSound } from "./sound-provider"

export default function SoundFallback() {
  const { playSound } = useSound()

  useEffect(() => {
    // Verificar se o áudio está funcionando
    const testAudio = new Audio()
    testAudio.src = "/sounds/click.mp3"

    const handleCanPlay = () => {
      console.log("Áudio está funcionando corretamente")
    }

    const handleError = () => {
      console.warn("Áudio não está funcionando, usando fallback visual")
      // Desativar sons automaticamente se não funcionarem
      localStorage.setItem("soundEnabled", "false")
    }

    testAudio.addEventListener("canplay", handleCanPlay)
    testAudio.addEventListener("error", handleError)

    testAudio.load()

    return () => {
      testAudio.removeEventListener("canplay", handleCanPlay)
      testAudio.removeEventListener("error", handleError)
    }
  }, [])

  return null
}

