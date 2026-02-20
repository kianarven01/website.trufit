import { createClient } from "@supabase/supabase-js";

// These will come from your Supabase Project Settings > API
const supabaseUrl = "https://fcmpbkhdgghpbwyzndhn.supabase.co";
const supabaseAnonKey = "sb_publishable_wyyflyYnktUY0Ow_TlhVKg_CIo0hRAH";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
