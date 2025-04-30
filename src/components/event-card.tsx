"use client"

import type React from "react"
import type { CSSProperties } from "react"

import type { Event } from "@/components/weekly-calendar"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: Event
  onClick: (e: React.MouseEvent) => void
  style?: CSSProperties
}

export function EventCard({ event, onClick, style }: EventCardProps) {
  // Calcular la duración en horas del evento
  const eventStartHour = Number.parseInt(event.startTime.split(":")[0])
  const eventEndHour = Number.parseInt(event.endTime.split(":")[0])
  const durationHours = eventEndHour - eventStartHour

  return (
    <div
      className={cn(
        "mb-1 cursor-pointer rounded-md p-1 text-xs shadow-sm absolute w-[calc(100%-8px)] flex flex-col justify-center",
        event.color
      )}
      onClick={onClick}
      style={style}
    >
      <div
        className="font-medium truncate"
        title={event.title}
      >
        {event.title}
      </div>
      {/* Solo muestra el horario y la tag si el evento ocupa 2 o más grids (2 horas o más) */}
      {durationHours >= 2 && (
        <>
          <div className="text-gray-700">
            {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}
          </div>
          {event.isRecurring && (
            <div className="mt-1 text-gray-600 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-600 mr-1"></span>
              Semanal
            </div>
          )}
        </>
      )}
    </div>
  )
}
