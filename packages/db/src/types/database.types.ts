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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      crises: {
        Row: {
          id: string
          name: string
          status: string
          start_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: string
          start_time?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: string
          start_time?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      responsibility_cards: {
        Row: {
          id: string
          role: string
          duties: string[]
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          role: string
          duties: string[]
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          duties?: string[]
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          content: string | null
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type?: string
          content?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          content?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          crisis_id: string | null
          timestamp: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          crisis_id?: string | null
          timestamp?: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          crisis_id?: string | null
          timestamp?: string
          description?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_crisis_id_fkey"
            columns: ["crisis_id"]
            referencedRelation: "crises"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      get_current_crisis: {
        Args: {}
        Returns: {
          id: string
          name: string
          status: string
          start_time: string
          duration: string
        }[]
      }
      get_activity_log: {
        Args: {
          p_crisis_id?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          crisis_id: string
          timestamp: string
          description: string
        }[]
      }
      get_responsibility_cards: {
        Args: {}
        Returns: {
          id: string
          role: string
          duties: string[]
          description: string | null
          created_at: string
        }[]
      }
      get_documents: {
        Args: {}
        Returns: {
          id: string
          title: string
          description: string | null
          type: string
          content: string | null
          file_url: string | null
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}