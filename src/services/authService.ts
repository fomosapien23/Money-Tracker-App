import { supabase } from "../lib/supabase";

function mapAuthError(error: any) {
  if (error?.message?.includes("Network request failed")) {
    return new Error(
      "Network request failed. Check internet and verify Supabase URL/key in app.json (expo.extra.supabaseUrl, expo.extra.supabaseAnonKey).",
    );
  }
  return error;
}

export const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw mapAuthError(error);
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw mapAuthError(error);
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
