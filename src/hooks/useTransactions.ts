import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/transactionService";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return { transactions, loading, reload: loadTransactions };
};
