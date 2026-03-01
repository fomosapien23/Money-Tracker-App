import { supabase } from "../lib/supabase";

export const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
