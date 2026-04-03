import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

type AppExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;
const supabaseUrl = extra.supabaseUrl ?? "";
const supabaseAnonKey = extra.supabaseAnonKey ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase config. Set expo.extra.supabaseUrl and expo.extra.supabaseAnonKey in app.json.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
