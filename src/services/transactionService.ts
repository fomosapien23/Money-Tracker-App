import { supabase } from "../lib/supabase";

export const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;

  return data;
};

export const addTransaction = async (transaction: any) => {
  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase.from("transactions").insert([
    {
      ...transaction,
      user_id: userData.user?.id,
    },
  ]);

  if (error) throw error;
};

export const updateTransaction = async (id: string, updatedData: any) => {
  const { error } = await supabase
    .from("transactions")
    .update(updatedData)
    .eq("id", id);

  if (error) throw error;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) throw error;
};
