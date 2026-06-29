export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price_cents: number;
          currency: string;
          cover_image_url: string | null;
          thumbnail_url: string | null;
          sample_url: string | null;
          download_url: string | null;
          category: string | null;
          level: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          price_cents: number;
          currency?: string;
          cover_image_url?: string | null;
          thumbnail_url?: string | null;
          sample_url?: string | null;
          download_url?: string | null;
          category?: string | null;
          level?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          price_cents?: number;
          currency?: string;
          cover_image_url?: string | null;
          thumbnail_url?: string | null;
          sample_url?: string | null;
          download_url?: string | null;
          category?: string | null;
          level?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          creem_payment_id: string | null;
          creem_checkout_id: string | null;
          amount_cents: number;
          currency: string;
          status: string;
          created_at: string;
          paid_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          creem_payment_id?: string | null;
          creem_checkout_id?: string | null;
          amount_cents: number;
          currency?: string;
          status?: string;
          created_at?: string;
          paid_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          creem_payment_id?: string | null;
          creem_checkout_id?: string | null;
          amount_cents?: number;
          currency?: string;
          status?: string;
          created_at?: string;
          paid_at?: string | null;
          updated_at?: string;
        };
      };
      download_access: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      has_purchased: {
        Args: { p_user_id: string; p_product_id: string };
        Returns: boolean;
      };
      get_user_purchases: {
        Args: { p_user_id: string };
        Returns: {
          product_id: string;
          title: string;
          slug: string;
          cover_image_url: string;
          category: string;
          level: string;
          purchased_at: string;
          download_url: string;
        }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}
