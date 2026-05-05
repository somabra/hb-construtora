/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly VERCEL_DEPLOY_HOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    supabase?: SupabaseClient;
    user?: User;
  }
}
