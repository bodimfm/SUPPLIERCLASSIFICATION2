"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface GameBadge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

interface BadgeCollectionProps {
  badges: GameBadge[]
  className?: string
}

export default function BadgeCollection({ badges, className }: BadgeCollectionProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <TooltipProvider>
        {badges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={`
                inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                ${
                  badge.unlocked
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }
              `}
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.description}</p>
              {!badge.unlocked && <p className="text-xs text-muted-foreground mt-1">Ainda não desbloqueado</p>}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

