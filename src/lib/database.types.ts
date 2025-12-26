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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'viewer' | 'editor' | 'admin'
          organization_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'viewer' | 'editor' | 'admin'
          organization_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'viewer' | 'editor' | 'admin'
          organization_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          title: string
          description: string
          file_name: string
          file_size: number
          duration: number
          mime_type: string
          storage_path: string
          thumbnail_path: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          processing_progress: number
          sensitivity_status: 'pending' | 'safe' | 'flagged'
          sensitivity_score: number
          upload_completed_at: string | null
          processing_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          title: string
          description?: string
          file_name: string
          file_size: number
          duration?: number
          mime_type: string
          storage_path: string
          thumbnail_path?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_progress?: number
          sensitivity_status?: 'pending' | 'safe' | 'flagged'
          sensitivity_score?: number
          upload_completed_at?: string | null
          processing_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          title?: string
          description?: string
          file_name?: string
          file_size?: number
          duration?: number
          mime_type?: string
          storage_path?: string
          thumbnail_path?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_progress?: number
          sensitivity_status?: 'pending' | 'safe' | 'flagged'
          sensitivity_score?: number
          upload_completed_at?: string | null
          processing_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      video_access: {
        Row: {
          id: string
          video_id: string
          user_id: string
          access_type: 'view' | 'edit' | 'admin'
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          access_type?: 'view' | 'edit' | 'admin'
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          access_type?: 'view' | 'edit' | 'admin'
          granted_by?: string | null
          granted_at?: string
        }
      }
    }
  }
}
