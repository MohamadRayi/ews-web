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
      sensors: {
        Row: {          id: string
          name: string
          location: string
          gps_location: [number, number] | null
          installation_date: string
          sensor_type: string
          last_calibration: string | null
          network_status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          gps_location?: [number, number]
          installation_date: string
          sensor_type: string
          last_calibration?: string
          network_status?: boolean
        }
        Update: {
          id?: string
          name?: string
          location?: string
          gps_location?: [number, number]
          installation_date?: string
          sensor_type?: string
          last_calibration?: string
          battery_level?: number
          network_status?: boolean
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
        }
        Update: {
          sensor_id?: string
          water_level?: number
          status?: 'normal' | 'warning' | 'siaga' | 'danger'
          reading_time?: string
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
          username?: string
          first_name?: string
          last_name?: string
        }
        Update: {
          telegram_id?: number
          username?: string
          first_name?: string
          last_name?: string
        }
      }      alert_history: {
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
        }
        Update: {
          sensor_id?: string
          status?: 'normal' | 'warning' | 'siaga' | 'danger'
          water_level?: number
          message?: string
        }
      }
    }
    Views: {
      current_sensor_status: {
        Row: {
          id: string
          name: string
          location: string
          battery_level: number
          water_level: number | null
          status: 'normal' | 'warning' | 'siaga' | 'danger' | null
          reading_time: string | null
        }
      }
    }
  }
}
