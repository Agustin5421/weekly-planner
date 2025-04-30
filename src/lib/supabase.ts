import { createClient } from "@supabase/supabase-js"
import type { Event } from "@/components/weekly-calendar"

// Create a singleton instance to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Helper function to convert camelCase to snake_case for database operations
export const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
    result[snakeKey] = obj[key]
  })
  return result
}

// Helper function to convert snake_case to camelCase for JavaScript
export const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = obj[key]
  })
  return result
}

export const getSupabaseClient = () => {
  // If we already have an instance, return it
  if (supabaseInstance) return supabaseInstance

  // Only create the client on the client side
  if (typeof window !== "undefined") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if the environment variables are available
    if (supabaseUrl && supabaseAnonKey) {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
      return supabaseInstance
    } else {
      console.error("Supabase environment variables are missing. Check your .env.local file.")
    }
  }

  // Return a mock client for server-side rendering or when env vars are missing
  return {
    from: (table: string) => ({
      select: () => {
        console.warn("Supabase not configured or running on server. Using localStorage fallback.")
        return { data: null, error: new Error("Supabase not configured") }
      },
      insert: () => {
        console.warn("Supabase not configured or running on server. Using localStorage fallback.")
        return { error: new Error("Supabase not configured") }
      },
      update: () => ({
        eq: () => {
          console.warn("Supabase not configured or running on server. Using localStorage fallback.")
          return { error: new Error("Supabase not configured") }
        },
      }),
      delete: () => ({
        eq: () => {
          console.warn("Supabase not configured or running on server. Using localStorage fallback.")
          return { error: new Error("Supabase not configured") }
        },
      }),
    }),
  } as any
}

// Helper functions for event operations
export const supabaseHelpers = {
  async getEvents() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("events").select("*")

    if (error) throw error

    // Convert snake_case to camelCase
    return data ? data.map((item) => toCamelCase(item) as Event) : []
  },

  async insertEvent(event: Omit<Event, "id">) {
    const supabase = getSupabaseClient()
    const id = Date.now().toString()

    // Convert camelCase to snake_case
    const snakeCaseEvent = toSnakeCase({
      ...event,
      id,
    })

    const { error } = await supabase.from("events").insert(snakeCaseEvent)

    if (error) throw error

    return { ...event, id }
  },

  async updateEvent(id: string, event: Omit<Event, "id">) {
    const supabase = getSupabaseClient()

    // Convert camelCase to snake_case
    const snakeCaseEvent = toSnakeCase(event)

    const { error } = await supabase.from("events").update(snakeCaseEvent).eq("id", id)

    if (error) throw error

    return { ...event, id }
  },

  async deleteEvent(id: string) {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) throw error

    return true
  },
}
