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
      error_logs: {
        Row: {
          component_stack: string | null;
          id: string;
          message: string;
          stack: string | null;
          timestamp: string;
          user_id: string | null;
        };
        Insert: {
          component_stack?: string | null;
          id?: string;
          message: string;
          stack?: string | null;
          timestamp?: string;
          user_id?: string | null;
        };
        Update: {
          component_stack?: string | null;
          id?: string;
          message?: string;
          stack?: string | null;
          timestamp?: string;
          user_id?: string | null;
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
        Args: { recipe_id: string };
        Returns: number;
      };
      create_error_logs_table_if_not_exists: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
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
          comment_row: Database['public']['Tables']['recipe_comments']['Row'];
        };
        Returns: string;
      };
      get_username_for_comment: {
        Args: {
          comment_row: Database['public']['Tables']['recipe_comments']['Row'];
        };
        Returns: string;
      };
      has_user_favorited_recipe: {
        Args: { user_id: string; recipe_id: string };
        Returns: boolean;
      };
      increment_usage_count: {
        Args: { recipe_id: string };
        Returns: number;
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

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
