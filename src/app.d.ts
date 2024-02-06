// src/app.d.ts

import type { Book } from '$lib/tables/books'
import { SupabaseClient, Session } from '@supabase/supabase-js'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      getSession(): Promise<Session | null>
    }
	
    interface PageData {
      session: Session | null,
    }
    // interface Error {}
    // interface Platform {}
  }
}