"use client"

interface MascoteCornerProps {
  message?: string
  showMessage?: boolean
  position?: "top-right" | "bottom-right"
  size?: "small" | "medium" | "large"
}

export default function MascoteCorner({
  message = "Estou aqui para ajudar!",
  showMessage = false,
  position = "top-right",
  size = "medium",
}: MascoteCornerProps) {
  // Componente desativado para não cobrir as perguntas
  return null
}

