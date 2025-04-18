"use client"

import { useState } from "react"
import { Volume2, VolumeX, Volume1 } from "lucide-react"
import { useSound } from "@/components/sound-provider"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function SoundControl() {
  const { isSoundEnabled, toggleSound, volume, setVolume, playSound } = useSound()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    toggleSound()
    if (!isSoundEnabled) {
      // Tocar som apenas quando estiver ativando o som
      playSound("click")
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    playSound("click")
  }

  const handleClick = () => {
    setIsOpen(!isOpen)
    playSound("click")
  }

  const VolumeIcon = () => {
    if (!isSoundEnabled) return <VolumeX className="h-4 w-4" />
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleClick}>
          <VolumeIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" side="top">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Som</span>
            <Button variant={isSoundEnabled ? "default" : "outline"} size="sm" onClick={handleToggle} className="h-8">
              {isSoundEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>

          {isSoundEnabled && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Volume</span>
                <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} aria-label="Volume" />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

