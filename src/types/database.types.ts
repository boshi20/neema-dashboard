/**
 * Supabase Database Types — Phase 2.5A
 *
 * This is an app-local typed contract aligned to the SQL migration:
 *   supabase/migrations/20260525181000_phase_2_5a_nema_mvp_schema.sql
 *
 * In CI/ops, prefer regenerating this from the live schema using:
 *   supabase gen types typescript --project-id <PROJECT_ID> --schema public > supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string;
          avatar_url: string | null;
          role: Database['public']['Enums']['user_role'];
          language: 'en' | 'ar';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email: string;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          language?: 'en' | 'ar';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          language?: 'en' | 'ar';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          logo_url: string | null;
          address: string;
          city: string;
          lat: number;
          lng: number;
          cuisine_type: string;
          phone: string | null;
          cr_number: string | null;
          cr_document_url: string | null;
          status: Database['public']['Enums']['restaurant_status'];
          rejection_reason: string | null;
          submitted_at: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          logo_url?: string | null;
          address: string;
          city: string;
          lat: number;
          lng: number;
          cuisine_type: string;
          phone?: string | null;
          cr_number?: string | null;
          cr_document_url?: string | null;
          status?: Database['public']['Enums']['restaurant_status'];
          rejection_reason?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          logo_url?: string | null;
          address?: string;
          city?: string;
          lat?: number;
          lng?: number;
          cuisine_type?: string;
          phone?: string | null;
          cr_number?: string | null;
          cr_document_url?: string | null;
          status?: Database['public']['Enums']['restaurant_status'];
          rejection_reason?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurants_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      food_listings: {
        Row: {
          id: string;
          restaurant_id: string;
          title: string;
          title_ar: string | null;
          description: string | null;
          description_ar: string | null;
          category: string | null;
          quantity: number;
          quantity_remaining: number;
          pickup_start: string;
          pickup_end: string;
          original_price: number;
          selling_price: number;
          images: string[];
          allergens: string[];
          status: Database['public']['Enums']['listing_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          title: string;
          title_ar?: string | null;
          description?: string | null;
          description_ar?: string | null;
          category?: string | null;
          quantity: number;
          quantity_remaining: number;
          pickup_start: string;
          pickup_end: string;
          original_price: number;
          selling_price: number;
          images?: string[];
          allergens?: string[];
          status?: Database['public']['Enums']['listing_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          title?: string;
          title_ar?: string | null;
          description?: string | null;
          description_ar?: string | null;
          category?: string | null;
          quantity?: number;
          quantity_remaining?: number;
          pickup_start?: string;
          pickup_end?: string;
          original_price?: number;
          selling_price?: number;
          images?: string[];
          allergens?: string[];
          status?: Database['public']['Enums']['listing_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'food_listings_restaurant_id_fkey';
            columns: ['restaurant_id'];
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          }
        ];
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          status: Database['public']['Enums']['reservation_status'];
          qr_code: string | null;
          amount_paid: number;
          payment_status: Database['public']['Enums']['payment_status'];
          payment_reference: string | null;
          picked_up_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          status?: Database['public']['Enums']['reservation_status'];
          qr_code?: string | null;
          amount_paid?: number;
          payment_status?: Database['public']['Enums']['payment_status'];
          payment_reference?: string | null;
          picked_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          status?: Database['public']['Enums']['reservation_status'];
          qr_code?: string | null;
          amount_paid?: number;
          payment_status?: Database['public']['Enums']['payment_status'];
          payment_reference?: string | null;
          picked_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_listing_id_fkey';
            columns: ['listing_id'];
            referencedRelation: 'food_listings';
            referencedColumns: ['id'];
          }
        ];
      };
      impact_stats: {
        Row: {
          user_id: string;
          meals_saved: number;
          co2_avoided: number;
          money_saved: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          meals_saved?: number;
          co2_avoided?: number;
          money_saved?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          meals_saved?: number;
          co2_avoided?: number;
          money_saved?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'impact_stats_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      reserve_listing: {
        Args: {
          p_listing_id: string;
        };
        Returns: Database['public']['Tables']['reservations']['Row'];
      };
    };
    Enums: {
      user_role: 'customer' | 'restaurant_owner' | 'admin';
      restaurant_status: 'pending_review' | 'approved' | 'rejected' | 'suspended';
      listing_status: 'draft' | 'active' | 'paused' | 'sold_out' | 'expired' | 'archived';
      reservation_status:
        | 'pending_payment'
        | 'confirmed'
        | 'cancelled_by_user'
        | 'cancelled_by_restaurant'
        | 'ready_for_pickup'
        | 'picked_up'
        | 'expired';
      payment_status: 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;

