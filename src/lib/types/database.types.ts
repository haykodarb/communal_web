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
      books: {
        Row: {
          author: string
          available: boolean
          created_at: string | null
          id: string
          image_path: string
          owner: string
          read: boolean
          review: string | null
          title: string
        }
        Insert: {
          author: string
          available?: boolean
          created_at?: string | null
          id?: string
          image_path: string
          owner: string
          read: boolean
          review?: string | null
          title: string
        }
        Update: {
          author?: string
          available?: boolean
          created_at?: string | null
          id?: string
          image_path?: string
          owner?: string
          read?: boolean
          review?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          created_at: string | null
          id: string
          image_path: string | null
          name: string
          owner: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_path?: string | null
          name: string
          owner?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_path?: string | null
          name?: string
          owner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      discussion_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender: string | null
          topic: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender?: string | null
          topic?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_messages_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_messages_topic_fkey"
            columns: ["topic"]
            isOneToOne: false
            referencedRelation: "discussion_topics"
            referencedColumns: ["id"]
          }
        ]
      }
      discussion_topics: {
        Row: {
          community: string | null
          created_at: string | null
          creator: string | null
          id: string
          name: string | null
        }
        Insert: {
          community?: string | null
          created_at?: string | null
          creator?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          community?: string | null
          created_at?: string | null
          creator?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_topics_community_fkey"
            columns: ["community"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_topics_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      loans: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          book: string | null
          community: string
          created_at: string
          id: string
          loanee: string
          owner: string | null
          rejected: boolean
          rejected_at: string | null
          returned: boolean
          returned_at: string | null
          review: string | null
          tool: string | null
        }
        Insert: {
          accepted?: boolean
          accepted_at?: string | null
          book?: string | null
          community: string
          created_at?: string
          id?: string
          loanee: string
          owner?: string | null
          rejected?: boolean
          rejected_at?: string | null
          returned?: boolean
          returned_at?: string | null
          review?: string | null
          tool?: string | null
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          book?: string | null
          community?: string
          created_at?: string
          id?: string
          loanee?: string
          owner?: string | null
          rejected?: boolean
          rejected_at?: string | null
          returned?: boolean
          returned_at?: string | null
          review?: string | null
          tool?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_book_fkey"
            columns: ["book"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_community_fkey"
            columns: ["community"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_loanee_fkey"
            columns: ["loanee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_tool_fkey"
            columns: ["tool"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          }
        ]
      }
      memberships: {
        Row: {
          accepted: boolean | null
          community: string
          created_at: string | null
          id: string
          is_admin: boolean
          joined_at: string | null
          member: string
        }
        Insert: {
          accepted?: boolean | null
          community: string
          created_at?: string | null
          id?: string
          is_admin?: boolean
          joined_at?: string | null
          member: string
        }
        Update: {
          accepted?: boolean | null
          community?: string
          created_at?: string | null
          id?: string
          is_admin?: boolean
          joined_at?: string | null
          member?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_community_fkey"
            columns: ["community"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          deleted_receiver: boolean
          deleted_sender: boolean
          id: string
          is_read: boolean
          receiver: string | null
          sender: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_receiver?: boolean
          deleted_sender?: boolean
          id?: string
          is_read?: boolean
          receiver?: string | null
          sender?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_receiver?: boolean
          deleted_sender?: boolean
          id?: string
          is_read?: boolean
          receiver?: string | null
          sender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          show_email: boolean
          username: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          show_email?: boolean
          username: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          show_email?: boolean
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tools: {
        Row: {
          available: boolean
          created_at: string
          description: string
          id: string
          image_path: string
          name: string
          owner: string | null
        }
        Insert: {
          available?: boolean
          created_at?: string
          description: string
          id?: string
          image_path: string
          name: string
          owner?: string | null
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string
          id?: string
          image_path?: string
          name?: string
          owner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      distinct_chats: {
        Row: {
          content: string | null
          created_at: string | null
          deleted_receiver: boolean | null
          deleted_sender: boolean | null
          id: string | null
          is_read: boolean | null
          receiver: string | null
          sender: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      delete_chat_for_user: {
        Args: {
          chatter_id: string
        }
        Returns: boolean
      }
      get_books_community:
        | {
            Args: {
              community_id: string
            }
            Returns: {
              author: string
              available: boolean
              created_at: string | null
              id: string
              image_path: string
              owner: string
              read: boolean
              review: string | null
              title: string
            }[]
          }
        | {
            Args: {
              community_id: string
              offset_num: number
              limit_num: number
            }
            Returns: {
              author: string
              available: boolean
              created_at: string | null
              id: string
              image_path: string
              owner: string
              read: boolean
              review: string | null
              title: string
            }[]
          }
        | {
            Args: {
              community_id: string
              offset_num: number
              limit_num: number
              search_query: string
            }
            Returns: {
              author: string
              available: boolean
              created_at: string | null
              id: string
              image_path: string
              owner: string
              read: boolean
              review: string | null
              title: string
            }[]
          }
      get_books_count_community:
        | {
            Args: {
              community_id: string
            }
            Returns: number
          }
        | {
            Args: {
              community_id: string
              offset_num: number
              limit_num: number
            }
            Returns: number
          }
      get_tools_community: {
        Args: {
          community_id: string
          offset_num: number
          limit_num: number
          search_query: string
        }
        Returns: {
          available: boolean
          created_at: string
          description: string
          id: string
          image_path: string
          name: string
          owner: string | null
        }[]
      }
      is_admin_of: {
        Args: {
          _user_id: string
          _community_id: string
        }
        Returns: boolean
      }
      is_member_of: {
        Args: {
          _user_id: string
          _community_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
