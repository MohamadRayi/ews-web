export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_history: {
        Row: {
          id: string
          sensor_id: string
          status: 'normal' | 'warning' | 'siaga' | 'danger'
          water_level: number
          message: string
          sent_at: string
        }
        Insert: {
          id?: string
          sensor_id: string
          status: 'normal' | 'warning' | 'siaga' | 'danger'
          water_level: number
          message: string
          sent_at?: string
        }
        Update: {
          id?: string
          sensor_id?: string
          status?: 'normal' | 'warning' | 'siaga' | 'danger'
          water_level?: number
          message?: string
          sent_at?: string
        }
      }
      current_sensor_status: {
        Row: {
          id: string
          name: string
          location: string
          battery_level: number | null
          water_level: number | null
          status: 'normal' | 'warning' | 'siaga' | 'danger' | null
          reading_time: string | null
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          location: string
          battery_level?: number | null
          water_level?: number | null
          status?: 'normal' | 'warning' | 'siaga' | 'danger' | null
          reading_time?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          battery_level?: number | null
          water_level?: number | null
          status?: 'normal' | 'warning' | 'siaga' | 'danger' | null
          reading_time?: string | null
          updated_at?: string
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          sensor_id: string
          maintenance_type: string
          description: string | null
          performed_by: string | null
          maintenance_date: string
          next_maintenance_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sensor_id: string
          maintenance_type: string
          description?: string | null
          performed_by?: string | null
          maintenance_date?: string
          next_maintenance_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sensor_id?: string
          maintenance_type?: string
          description?: string | null
          performed_by?: string | null
          maintenance_date?: string
          next_maintenance_date?: string | null
          created_at?: string
        }
      }
      sensors: {
        Row: {
          id: string
          name: string
          location: string
          gps_location: { x: number; y: number } | null
          installation_date: string
          sensor_type: string
          last_calibration: string | null
          battery_level: number | null
          network_status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          gps_location?: { x: number; y: number } | null
          installation_date: string
          sensor_type: string
          last_calibration?: string | null
          battery_level?: number | null
          network_status?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          gps_location?: { x: number; y: number } | null
          installation_date?: string
          sensor_type?: string
          last_calibration?: string | null
          battery_level?: number | null
          network_status?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      telegram_users: {
        Row: {
          id: string
          telegram_id: number
          username: string | null
          first_name: string | null
          last_name: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          joined_at?: string
        }
      }
      water_level_readings: {
        Row: {
          id: string
          sensor_id: string
          water_level: number
          status: 'normal' | 'warning' | 'siaga' | 'danger'
          reading_time: string
          created_at: string
        }
        Insert: {
          id?: string
          sensor_id: string
          water_level: number
          status: 'normal' | 'warning' | 'siaga' | 'danger'
          reading_time?: string
          created_at?: string
        }
        Update: {
          id?: string
          sensor_id?: string
          water_level?: number
          status?: 'normal' | 'warning' | 'siaga' | 'danger'
          reading_time?: string
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
      sensor_status: 'normal' | 'warning' | 'siaga' | 'danger'
    }
  }
}
