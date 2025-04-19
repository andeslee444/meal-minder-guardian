export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cached_recipes: {
        Row: {
          ai_model: string | null;
          cook_time: number;
          created_at: string | null;
          filter_mode: string;
          id: string;
          image: string | null;
          ingredients: Json;
          instructions: string[];
          inventory_ingredients: string[];
          prep_time: number;
          servings: number;
          tags: string[] | null;
          title: string;
          usage_count: number | null;
        };
        Insert: {
          ai_model?: string | null;
          cook_time: number;
          created_at?: string | null;
          filter_mode: string;
          id?: string;
          image?: string | null;
          ingredients: Json;
          instructions: string[];
          inventory_ingredients: string[];
          prep_time: number;
          servings: number;
          tags?: string[] | null;
          title: string;
          usage_count?: number | null;
        };
        Update: {
          ai_model?: string | null;
          cook_time?: number;
          created_at?: string | null;
          filter_mode?: string;
          id?: string;
          image?: string | null;
          ingredients?: Json;
          instructions?: string[];
          inventory_ingredients?: string[];
          prep_time?: number;
          servings?: number;
          tags?: string[] | null;
          title?: string;
          usage_count?: number | null;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          category: string | null;
          created_at: string | null;
          expiration_date: string | null;
          id: string;
          name: string;
          notes: string | null;
          price: number | null;
          purchase_date: string | null;
          quantity: number;
          store: string | null;
          unit: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          expiration_date?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          price?: number | null;
          purchase_date?: string | null;
          quantity: number;
          store?: string | null;
          unit: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          expiration_date?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          price?: number | null;
          purchase_date?: string | null;
          quantity?: number;
          store?: string | null;
          unit?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      recipe_comments: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          likes: number | null;
          recipe_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          likes?: number | null;
          recipe_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          likes?: number | null;
          recipe_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_comments_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_favorites: {
        Row: {
          created_at: string | null;
          id: string;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_favorites_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipes: {
        Row: {
          cook_time: number;
          created_at: string | null;
          id: string;
          image: string | null;
          ingredients: Json;
          instructions: string[];
          prep_time: number;
          servings: number;
          tags: string[] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          cook_time: number;
          created_at?: string | null;
          id?: string;
          image?: string | null;
          ingredients: Json;
          instructions: string[];
          prep_time: number;
          servings: number;
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          cook_time?: number;
          created_at?: string | null;
          id?: string;
          image?: string | null;
          ingredients?: Json;
          instructions?: string[];
          prep_time?: number;
          servings?: number;
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      error_logs: {
        Row: {
          id: string;
          message: string;
          stack: string | null;
          component_stack: string | null;
          user_id: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          message: string;
          stack?: string | null;
          component_stack?: string | null;
          user_id?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          message?: string;
          stack?: string | null;
          component_stack?: string | null;
          user_id?: string | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'error_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      recipe_comments_with_user: {
        Row: {
          avatar_url: string | null;
          content: string | null;
          created_at: string | null;
          id: string | null;
          likes: number | null;
          recipe_id: string | null;
          updated_at: string | null;
          user_id: string | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_comments_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      count_recipe_favorites: {
        Args: {
          recipe_id: string;
        };
        Returns: number;
      };
      find_matching_cached_recipes: {
        Args: {
          input_ingredients: string[];
          filter_mode: string;
          limit_count?: number;
        };
        Returns: {
          id: string;
          title: string;
          ingredients: Json;
          instructions: string[];
          prep_time: number;
          cook_time: number;
          servings: number;
          image: string;
          tags: string[];
          match_percentage: number;
        }[];
      };
      get_avatar_for_comment: {
        Args: {
          comment_row: unknown;
        };
        Returns: string;
      };
      get_username_for_comment: {
        Args: {
          comment_row: unknown;
        };
        Returns: string;
      };
      has_user_favorited_recipe: {
        Args: {
          user_id: string;
          recipe_id: string;
        };
        Returns: boolean;
      };
      increment_usage_count: {
        Args: {
          recipe_id: string;
        };
        Returns: number;
      };
      create_error_logs_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
