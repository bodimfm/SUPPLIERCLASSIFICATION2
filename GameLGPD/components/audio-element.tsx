"use client"

import { useEffect, useRef, useState } from "react"

interface AudioElementProps {
  sources: {
    src: string
    type: string
  }[]
  preload?: "auto" | "metadata" | "none"
  volume?: number
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function AudioElement({ sources, preload = "auto", volume = 1, onError, onLoad }: AudioElementProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!audioRef.current) return

    const handleCanPlayThrough = () => {
      setLoaded(true)
      if (onLoad) onLoad()
    }

    const handleError = (e: ErrorEvent) => {
      console.error("Erro ao carregar áudio:", e)
      if (onError) onError(new Error("Falha ao carregar áudio"))
    }

    const audio = audioRef.current
    audio.volume = volume
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audio.addEventListener("error", handleError as EventListener)

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.removeEventListener("error", handleError as EventListener)
    }
  }, [onError, onLoad, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  return (
    <audio ref={audioRef} preload={preload} style={{ display: "none" }}>
      {sources.map((source, index) => (
        <source key={index} src={source.src} type={source.type} />
      ))}
      Seu navegador não suporta o elemento de áudio.
    </audio>
  )
}

export default AudioElement

