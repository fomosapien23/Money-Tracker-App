import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ddqutconvazyjrimbyhf.supabase.co";
const supabaseAnonKey = "sb_publishable_TnyXKCMfxKCQX8qcXjI0_g_vvfTmgx9";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
