"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LightbulbIcon } from "lucide-react"
import { useSound } from "./sound-provider"
import { useEffect } from "react"

interface TipModalProps {
  title: string
  content: string
  isOpen: boolean
  onClose: () => void
}

export default function TipModal({ title, content, isOpen, onClose }: TipModalProps) {
  const { playSound } = useSound()

  useEffect(() => {
    if (isOpen) {
      playSound("transition")
    }
  }, [isOpen, playSound])

  const handleClose = () => {
    playSound("click")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <LightbulbIcon className="h-5 w-5 text-yellow-500" />
            </motion.div>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>Dica importante sobre LGPD e avaliação de fornecedores</DialogDescription>
        </DialogHeader>
        <motion.div
          className="p-4 bg-blue-50 rounded-md text-blue-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {content}
        </motion.div>
        <DialogFooter>
          <Button onClick={handleClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

