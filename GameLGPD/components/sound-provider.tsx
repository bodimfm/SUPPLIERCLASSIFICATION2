"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

type SoundType = "correct" | "incorrect" | "complete" | "click" | "transition"

interface SoundContextType {
  playSound: (type: SoundType) => void
  isSoundEnabled: boolean
  toggleSound: () => void
  volume: number
  setVolume: (volume: number) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

interface SoundProviderProps {
  children: ReactNode
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true)
  const [volume, setVolume] = useState<number>(0.5)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  // Inicializar o AudioContext no lado do cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Criar o AudioContext apenas uma vez
        const context = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(context)

        return () => {
          // Limpar o AudioContext quando o componente for desmontado
          if (context && context.state !== "closed") {
            context.close()
          }
        }
      } catch (error) {
        console.warn("Web Audio API não é suportada neste navegador:", error)
      }
    }
  }, [])

  // Carregar preferência de som do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSoundPreference = localStorage.getItem("soundEnabled")
      if (savedSoundPreference !== null) {
        setIsSoundEnabled(savedSoundPreference === "true")
      }

      const savedVolume = localStorage.getItem("soundVolume")
      if (savedVolume !== null) {
        setVolume(Number.parseFloat(savedVolume))
      }
    }
  }, [])

  // Salvar preferência de som no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("soundEnabled", isSoundEnabled.toString())
    }
  }, [isSoundEnabled])

  // Salvar volume no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("soundVolume", volume.toString())
    }
  }, [volume])

  // Função para gerar sons usando a Web Audio API
  const generateSound = useCallback(
    (type: SoundType) => {
      if (!audioContext) return

      // Criar um oscilador para gerar o som
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Configurar o tipo de som com base no tipo solicitado
      switch (type) {
        case "correct":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // Nota A5
          oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.1) // Nota A6
          gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
          oscillator.connect(gainNode).connect(audioContext.destination)
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.3)
          break

        case "incorrect":
          oscillator.type = "sawtooth"
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // Nota A4
          oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.2) // Nota A3
          gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
          oscillator.connect(gainNode).connect(audioContext.destination)
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.3)
          break

        case "complete":
          // Primeiro tom
          const osc1 = audioContext.createOscillator()
          const gain1 = audioContext.createGain()
          osc1.type = "sine"
          osc1.frequency.setValueAtTime(523.25, audioContext.currentTime) // Nota C5
          gain1.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
          gain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
          osc1.connect(gain1).connect(audioContext.destination)
          osc1.start()
          osc1.stop(audioContext.currentTime + 0.2)

          // Segundo tom
          const osc2 = audioContext.createOscillator()
          const gain2 = audioContext.createGain()
          osc2.type = "sine"
          osc2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2) // Nota E5
          gain2.gain.setValueAtTime(volume * 0.3, audioContext.currentTime + 0.2)
          gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4)
          osc2.connect(gain2).connect(audioContext.destination)
          osc2.start(audioContext.currentTime + 0.2)
          osc2.stop(audioContext.currentTime + 0.4)

          // Terceiro tom
          const osc3 = audioContext.createOscillator()
          const gain3 = audioContext.createGain()
          osc3.type = "sine"
          osc3.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4) // Nota G5
          gain3.gain.setValueAtTime(volume * 0.3, audioContext.currentTime + 0.4)
          gain3.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.7)
          osc3.connect(gain3).connect(audioContext.destination)
          osc3.start(audioContext.currentTime + 0.4)
          osc3.stop(audioContext.currentTime + 0.7)
          break

        case "click":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05)
          gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05)
          oscillator.connect(gainNode).connect(audioContext.destination)
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.05)
          break

        case "transition":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // Nota A4
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2) // Nota A5
          gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4)
          oscillator.connect(gainNode).connect(audioContext.destination)
          oscillator.start()
          oscillator.stop(audioContext.currentTime + 0.4)
          break
      }
    },
    [audioContext, volume],
  )

  const playSound = useCallback(
    (type: SoundType) => {
      if (!isSoundEnabled) return

      try {
        // Verificar se o contexto de áudio está suspenso (comum em navegadores modernos)
        if (audioContext && audioContext.state === "suspended") {
          audioContext
            .resume()
            .then(() => {
              generateSound(type)
            })
            .catch((error) => {
              console.warn("Erro ao retomar o contexto de áudio:", error)
            })
        } else {
          generateSound(type)
        }
      } catch (error) {
        console.warn(`Erro ao reproduzir som ${type}:`, error)
      }
    },
    [isSoundEnabled, audioContext, generateSound],
  )

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev)
  }, [])

  const value = {
    playSound,
    isSoundEnabled,
    toggleSound,
    volume,
    setVolume,
  }

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}

