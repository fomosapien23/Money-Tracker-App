import type { Transaction } from "@/src/type/transaction";
import { useCallback, useEffect, useState } from "react";
import { fetchTransactions } from "../services/transactionService";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data || []);
    } catch (err: any) {
      setTransactions([]);
      setError(err?.message ?? "Unable to load transactions");
      // Avoid console.error here because it shows a red error overlay in RN dev.
      console.warn("loadTransactions failed:", err?.message ?? err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return { transactions, loading, error, reload: loadTransactions };
};
