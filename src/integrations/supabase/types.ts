export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          church_id: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          church_id?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          church_id?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      churches: {
        Row: {
          id: string
          name: string
          denomination: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          website: string | null
          community_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          denomination?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          website?: string | null
          community_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          denomination?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          website?: string | null
          community_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'clergy' | 'parish'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'clergy' | 'parish'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'clergy' | 'parish'
          created_at?: string
          updated_at?: string
        }
      }
      church_modules: {
        Row: {
          id: string
          church_id: string
          module_name: string
          module_price: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          module_name: string
          module_price?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          module_name?: string
          module_price?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      church_agents: {
        Row: {
          id: string
          church_id: string
          module_name: string
          agent_name: string
          agent_price: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          module_name: string
          agent_name: string
          agent_price?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          module_name?: string
          agent_name?: string
          agent_price?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      clergy_phases: {
        Row: {
          id: string
          phase_number: number
          title: string
          description: string | null
          icon_name: string | null
          color: string | null
          estimated_days: number | null
          prerequisites: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phase_number: number
          title: string
          description?: string | null
          icon_name?: string | null
          color?: string | null
          estimated_days?: number | null
          prerequisites?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phase_number?: number
          title?: string
          description?: string | null
          icon_name?: string | null
          color?: string | null
          estimated_days?: number | null
          prerequisites?: Json
          created_at?: string
          updated_at?: string
        }
      }
      clergy_steps: {
        Row: {
          id: string
          phase_id: string
          step_number: number
          title: string
          description: string | null
          type: string
          data_schema: Json | null
          is_required: boolean
          prerequisite_steps: Json
          estimated_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phase_id: string
          step_number: number
          title: string
          description?: string | null
          type: string
          data_schema?: Json | null
          is_required?: boolean
          prerequisite_steps?: Json
          estimated_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phase_id?: string
          step_number?: number
          title?: string
          description?: string | null
          type?: string
          data_schema?: Json | null
          is_required?: boolean
          prerequisite_steps?: Json
          estimated_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      church_planning_progress: {
        Row: {
          id: string
          church_id: string
          phase_id: string
          status: string
          started_at: string | null
          completed_at: string | null
          completion_percentage: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          phase_id: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          completion_percentage?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          phase_id?: string
          status?: string
          started_at?: string | null
          completed_at?: string | null
          completion_percentage?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      church_step_progress: {
        Row: {
          id: string
          church_id: string
          step_id: string
          status: string
          data: Json
          started_at: string | null
          completed_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          church_id: string
          step_id: string
          status?: string
          data?: Json
          started_at?: string | null
          completed_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          step_id?: string
          status?: string
          data?: Json
          started_at?: string | null
          completed_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      church_planning_achievements: {
        Row: {
          id: string
          church_id: string
          achievement_type: string
          achievement_value: string
          unlocked_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          church_id: string
          achievement_type: string
          achievement_value: string
          unlocked_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          church_id?: string
          achievement_type?: string
          achievement_value?: string
          unlocked_at?: string
          metadata?: Json
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
      user_role_type: 'admin' | 'clergy' | 'parish'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
