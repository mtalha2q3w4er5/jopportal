import { createClient } from "@supabase/supabase-js"

// Access the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables. Please check your environment configuration.")
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
})()

export type UserRole = "admin" | "jobseeker" | "employer"

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  is_active?: boolean
}

export interface JobSeekerProfile extends UserProfile {
  resume_url?: string
  skills?: string[]
  experience?: string
  education?: string
  location?: string
  phone?: string
}

export interface EmployerProfile extends UserProfile {
  company_name?: string
  company_website?: string
  company_description?: string
  industry?: string
  company_size?: string
  location?: string
  phone?: string
}
