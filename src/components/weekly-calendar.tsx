"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventModal } from "@/components/event-modal"
import { EventCard } from "@/components/event-card"
import { cn } from "@/lib/utils"
import { supabaseHelpers } from "@/lib/supabase"

export type Event = {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  color: string
  isRecurring?: boolean
  createdAt?: string
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 9) // 9 AM to 10 PM

const COLOR_OPTIONS = [
  "bg-pink-200 hover:bg-pink-300",
  "bg-blue-200 hover:bg-blue-300",
  "bg-green-200 hover:bg-green-300",
  "bg-purple-200 hover:bg-purple-300",
  "bg-yellow-200 hover:bg-yellow-300",
  "bg-red-200 hover:bg-red-300",
  "bg-orange-200 hover:bg-orange-300",
  "bg-teal-200 hover:bg-teal-300",
  "bg-cyan-200 hover:bg-cyan-300",
  "bg-indigo-200 hover:bg-indigo-300",
  "bg-rose-200 hover:bg-rose-300",
  "bg-amber-200 hover:bg-amber-300",
  "bg-lime-200 hover:bg-lime-300",
  "bg-emerald-200 hover:bg-emerald-300",
  "bg-sky-200 hover:bg-sky-300",
]

export function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabaseInitialized, setSupabaseInitialized] = useState(false)

  // Initialize Supabase client
  useEffect(() => {
    // This ensures Supabase client is only initialized on the client side
    setSupabaseInitialized(true)
  }, [])

  // Load events from Supabase and fallback to localStorage
  useEffect(() => {
    if (!supabaseInitialized) return

    async function fetchEvents() {
      setIsLoading(true)
      setError(null)

      try {
        // Try to fetch from Supabase
        const data = await supabaseHelpers.getEvents()

        if (data && data.length > 0) {
          setEvents(data)
          // Also save to localStorage as backup
          localStorage.setItem("calendarEvents", JSON.stringify(data))
        } else {
          // If no data in Supabase, try localStorage
          const savedEvents = localStorage.getItem("calendarEvents")
          if (savedEvents) {
            const parsedEvents = JSON.parse(savedEvents)
            setEvents(parsedEvents)

            // Optionally sync localStorage events to Supabase
            try {
              for (const event of parsedEvents) {
                const { id, ...eventData } = event
                await supabaseHelpers.insertEvent(eventData)
              }
            } catch (syncError) {
              console.error("Error syncing to Supabase:", syncError)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching from Supabase:", err)

        // Fallback to localStorage
        try {
          const savedEvents = localStorage.getItem("calendarEvents")
          if (savedEvents) {
            setEvents(JSON.parse(savedEvents))
          }
        } catch (localErr) {
          console.error("Error fetching from localStorage:", localErr)
          setError("No se pudieron cargar los eventos. Por favor, intenta de nuevo más tarde.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [supabaseInitialized])

  // Generate week days whenever currentDate changes
  useEffect(() => {
    // Generate week days starting from Monday
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    setWeekDays(days)
  }, [currentDate])

  // Backup to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("calendarEvents", JSON.stringify(events))
    }
  }, [events])

  const handlePrevWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7))
  }

  const handleAddEvent = (hour: number, day: Date) => {
    setSelectedDay(day)
    setSelectedHour(hour)
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setSelectedDay(parseISO(event.date))
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (eventData: Omit<Event, "id">) => {
    try {
      if (editingEvent) {
        // Update existing event
        const updatedEvent = await supabaseHelpers.updateEvent(editingEvent.id, eventData)

        setEvents((prev) => prev.map((event) => (event.id === editingEvent.id ? updatedEvent : event)))
      } else {
        // Add new event
        const newEvent = await supabaseHelpers.insertEvent(eventData)

        setEvents((prev) => [...prev, newEvent])
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error saving event:", err)

      // Fallback to local state if Supabase fails
      if (editingEvent) {
        setEvents((prev) =>
          prev.map((event) => (event.id === editingEvent.id ? { ...eventData, id: event.id } : event)),
        )
      } else {
        const newEvent: Event = {
          ...eventData,
          id: Date.now().toString(),
        }
        setEvents((prev) => [...prev, newEvent])
      }
      setIsModalOpen(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await supabaseHelpers.deleteEvent(id)

      setEvents((prev) => prev.filter((event) => event.id !== id))
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error deleting event:", err)

      // Fallback to local state if Supabase fails
      setEvents((prev) => prev.filter((event) => event.id !== id))
      setIsModalOpen(false)
    }
  }

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const formattedDate = format(day, "yyyy-MM-dd")
    const dayOfWeek = format(day, "EEEE", { locale: es }).toLowerCase()

    return events.filter((event) => {
      const eventDate = event.date
      const eventStartHour = Number.parseInt(event.startTime.split(":")[0])
      const eventEndHour = Number.parseInt(event.endTime.split(":")[0])

      // Check if this is a recurring event
      if (event.isRecurring) {
        const eventDay = format(parseISO(eventDate), "EEEE", { locale: es }).toLowerCase()
        // If day of week matches and hour is within range
        return eventDay === dayOfWeek && eventStartHour <= hour && eventEndHour > hour
      }

      // Regular non-recurring event
      return eventDate === formattedDate && eventStartHour <= hour && eventEndHour > hour
    })
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-700">
          {format(weekDays[0] || new Date(), "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{error}</div>}

      <div
        className={cn(
          "grid grid-cols-8 rounded-lg border bg-white shadow-sm",
          // Solo permite scroll en pantallas pequeñas
          "overflow-x-auto",
          "sm:overflow-y-hidden", // Oculta scroll vertical en sm y superior
          "overflow-y-auto sm:overflow-y-hidden" // Muestra scroll vertical solo en xs
        )}
        style={{
          height: "calc(100vh - 180px)",
          minHeight: 0,
        }}
      >
        {/* Time column */}
        <div className="col-span-1 border-r">
          <div className="h-12 border-b bg-gray-50 flex items-center justify-center font-medium text-gray-500">
            Hora
          </div>
          {HOURS.map((hour) => (
            <div
              key={`hour-${hour}`}
              style={{ height: `calc((100vh - 180px - 48px) / ${HOURS.length})` }} // 48px es la cabecera de horas
              className="border-b flex items-center justify-center text-sm text-gray-500"
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days columns */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="col-span-1 border-r last:border-r-0 w-full">
            <div
              className={cn(
                "h-12 border-b flex flex-col justify-center items-center w-full",
                isSameDay(day, new Date()) ? "bg-blue-100 text-blue-800" : "bg-gray-50 text-gray-500",
              )}
            >
              <div className="text-sm">{format(day, "EEE", { locale: es })}</div>
              <div className="text-base">{format(day, "d")}</div>
            </div>

            {HOURS.map((hour) => {
              const dayEvents = getEventsForDayAndHour(day, hour)
              const startHourEvents = dayEvents.filter((event) => {
                const eventStartHour = Number.parseInt(event.startTime.split(":")[0])
                return eventStartHour === hour
              })

              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  style={{ height: `calc((100vh - 180px - 48px) / ${HOURS.length})` }}
                  className="relative border-b p-1 w-full"
                  onClick={() => handleAddEvent(hour, day)}
                >
                  {dayEvents.length === 0 && (
                    <div className="flex h-full w-full items-center justify-center opacity-0 hover:opacity-100">
                      <CalendarPlus className="h-5 w-5 text-gray-400" />
                    </div>
                  )}

                  {startHourEvents.map((event) => {
                    const eventStartHour = Number.parseInt(event.startTime.split(":")[0])
                    const eventEndHour = Number.parseInt(event.endTime.split(":")[0])
                    const durationHours = eventEndHour - eventStartHour

                    // Calcula la altura basada en la duración y el alto dinámico de la celda
                    const cellHeight = `calc((100vh - 180px - 48px) / ${HOURS.length})`
                    const heightStyle = {
                      height: `calc(${durationHours} * ${cellHeight} - 8px)`,
                      zIndex: 10,
                    }

                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        style={heightStyle}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditEvent(event)
                        }}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {isLoading && <div className="mt-4 text-center text-gray-500">Cargando eventos...</div>}

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        selectedDay={selectedDay}
        selectedHour={selectedHour}
        event={editingEvent}
        colorOptions={COLOR_OPTIONS}
      />
    </div>
  )
}
