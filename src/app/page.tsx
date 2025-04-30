"use client"
import { WeeklyCalendar } from "@/components/weekly-calendar"

export default function Home() {
  return (
    <main className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 md:text-3xl">My weekly planner</h1>
        <WeeklyCalendar />
      </div>
    </main>
  )
}
