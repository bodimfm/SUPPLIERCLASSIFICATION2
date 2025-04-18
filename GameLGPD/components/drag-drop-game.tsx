"use client"

import { useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DataItem {
  id: string
  content: string
  category: string
}

interface Category {
  id: string
  name: string
  items: DataItem[]
}

interface DraggableItemProps {
  id: string
  content: string
}

function DraggableItem({ id, content }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-md p-3 mb-2 flex items-center gap-2 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-gray-400" />
      <span>{content}</span>
    </div>
  )
}

// Vamos corrigir o componente DragDropGame para garantir que todos os itens possam ser arrastados corretamente

// Primeiro, vamos modificar a interface DropZoneProps para incluir o id da categoria
interface DropZoneProps {
  category: Category
  onDrop: (item: DataItem, categoryId: string) => void
}

// Agora vamos atualizar o componente DropZone para incluir o id como atributo de dados
function DropZone({ category, onDrop }: DropZoneProps) {
  return (
    <div
      className="bg-slate-50 border-2 border-dashed rounded-lg p-3 min-h-[200px]"
      data-id={category.id} // Adicionar o id como atributo de dados
    >
      <h3 className="font-medium text-center mb-3">{category.name}</h3>
      <div className="space-y-2">
        {category.items.map((item) => (
          <div key={item.id} className="bg-white border rounded-md p-3 flex items-center gap-2">
            <span>{item.content}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DragDropGameProps {
  items: DataItem[]
  categories: Omit<Category, "items">[]
  onComplete: (result: { correct: number; total: number }) => void
}

export default function DragDropGame({ items, categories, onComplete }: DragDropGameProps) {
  const [gameItems, setGameItems] = useState<DataItem[]>(items)
  const [gameCategories, setGameCategories] = useState<Category[]>(categories.map((cat) => ({ ...cat, items: [] })))
  const [completed, setCompleted] = useState(false)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const itemId = active.id as string
      // Obter o id da categoria do atributo de dados do elemento
      const overElement = over.data.current?.droppableContainer?.node
      const categoryId = overElement?.dataset?.id

      if (categoryId) {
        const item = gameItems.find((i) => i.id === itemId)

        if (item) {
          // Remove from items
          setGameItems(gameItems.filter((i) => i.id !== itemId))

          // Add to category
          setGameCategories(
            gameCategories.map((cat) => {
              if (cat.id === categoryId) {
                return {
                  ...cat,
                  items: [...cat.items, item],
                }
              }
              return cat
            }),
          )
        }
      }
    }
  }

  const handleVerify = () => {
    let correct = 0
    let total = 0

    gameCategories.forEach((category) => {
      category.items.forEach((item) => {
        total++
        if (item.category === category.id) {
          correct++
        }
      })
    })

    setCompleted(true)
    onComplete({ correct, total })
  }

  const allItemsPlaced = gameItems.length === 0

  return (
    <div className="space-y-6">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gameCategories.map((category) => (
            <DropZone
              key={category.id}
              category={category}
              onDrop={(item, categoryId) => {
                // This is handled in handleDragEnd
              }}
            />
          ))}
        </div>

        {gameItems.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Itens para classificar:</h3>
              <SortableContext items={gameItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {gameItems.map((item) => (
                  <DraggableItem key={item.id} id={item.id} content={item.content} />
                ))}
              </SortableContext>
            </CardContent>
          </Card>
        )}
      </DndContext>

      <div className="flex justify-center">
        <Button onClick={handleVerify} disabled={!allItemsPlaced || completed}>
          Verificar Classificação
        </Button>
      </div>
    </div>
  )
}

