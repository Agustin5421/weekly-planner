"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Event } from "@/components/weekly-calendar"
import { cn } from "@/lib/utils"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<Event, "id">) => void
  onDelete?: () => void
  selectedDay: Date | null
  selectedHour: number | null
  event: Event | null
  colorOptions: string[]
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDay,
  selectedHour,
  event,
  colorOptions,
}: EventModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const [isRecurring, setIsRecurring] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode - populate with event data
        setTitle(event.title)
        setDescription(event.description || "")
        setDate(event.date)
        setStartTime(event.startTime)
        setEndTime(event.endTime)
        setSelectedColor(event.color)
        setIsRecurring(event.isRecurring || false)
      } else {
        // Create mode - set defaults
        setTitle("")
        setDescription("")

        if (selectedDay) {
          setDate(format(selectedDay, "yyyy-MM-dd"))
        }

        if (selectedHour !== null) {
          setStartTime(`${selectedHour.toString().padStart(2, "0")}:00`)
          setEndTime(`${(selectedHour + 1).toString().padStart(2, "0")}:00`)
        }

        setSelectedColor(colorOptions[0])
        setIsRecurring(false)
      }
    }
  }, [isOpen, event, selectedDay, selectedHour, colorOptions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      description,
      date,
      startTime,
      endTime,
      color: selectedColor,
      isRecurring,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora fin</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={cn(
                      color,
                      "h-8 w-8 rounded-full border transition-all",
                      selectedColor === color ? "ring-2 ring-offset-2" : "",
                    )}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isRecurring">Repetir semanalmente</Label>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            {onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Eliminar
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
