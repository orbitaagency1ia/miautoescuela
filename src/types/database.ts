/**
 * Database Types
 * Tipos de base de datos generados desde Supabase
 *
 * Estos tipos se pueden generar automáticamente usando:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          contact_email: string | null
          phone: string | null
          subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          contact_email?: string | null
          phone?: string | null
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          contact_email?: string | null
          phone?: string | null
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          user_id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
      }
      school_members: {
        Row: {
          id: string
          school_id: string
          user_id: string
          role: 'admin' | 'owner' | 'student'
          status: 'active' | 'suspended' | 'removed'
          invited_by: string | null
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          user_id: string
          role: 'admin' | 'owner' | 'student'
          status?: 'active' | 'suspended' | 'removed'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          user_id?: string
          role?: 'admin' | 'owner' | 'student'
          status?: 'active' | 'suspended' | 'removed'
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          school_id: string
          email: string
          role: 'owner' | 'student'
          token_hash: string
          invited_by: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          email: string
          role?: 'owner' | 'student'
          token_hash: string
          invited_by: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          email?: string
          role?: 'owner' | 'student'
          token_hash?: string
          invited_by?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          school_id: string
          title: string
          description: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          title: string
          description?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          title?: string
          description?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          school_id: string
          module_id: string
          title: string
          description: string | null
          video_path: string | null
          video_duration_seconds: number | null
          thumbnail_url: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          module_id: string
          title: string
          description?: string | null
          video_path?: string | null
          video_duration_seconds?: number | null
          thumbnail_url?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          module_id?: string
          title?: string
          description?: string | null
          video_path?: string | null
          video_duration_seconds?: number | null
          thumbnail_url?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lesson_progress: {
        Row: {
          id: string
          school_id: string
          lesson_id: string
          user_id: string
          progress_percent: number
          completed_at: string | null
          last_watched_at: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          lesson_id: string
          user_id: string
          progress_percent?: number
          completed_at?: string | null
          last_watched_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          lesson_id?: string
          user_id?: string
          progress_percent?: number
          completed_at?: string | null
          last_watched_at?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          school_id: string
          author_id: string
          title: string
          body: string
          is_pinned: boolean
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          author_id: string
          title: string
          body: string
          is_pinned?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          author_id?: string
          title?: string
          body?: string
          is_pinned?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          school_id: string
          post_id: string
          author_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          post_id: string
          author_id: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          post_id?: string
          author_id?: string
          body?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_events: {
        Row: {
          id: string
          school_id: string
          user_id: string
          event_type: 'lesson_completed' | 'post_created' | 'comment_created'
          points: number
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          user_id: string
          event_type: 'lesson_completed' | 'post_created' | 'comment_created'
          points: number
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          user_id?: string
          event_type?: 'lesson_completed' | 'post_created' | 'comment_created'
          points?: number
          reference_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
