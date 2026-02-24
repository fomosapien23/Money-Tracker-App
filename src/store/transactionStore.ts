import { create } from "zustand";
import {
    addTransaction as addLocal,
    deleteTransaction as deleteLocal,
    getTransactions as getLocal,
    updateTransaction,
} from "../services/localTransactions";
import { Transaction } from "../type/transaction";

type TransactionStore = {
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    loadTransactions: () => void;
    updateTransaction: (tx: Transaction) => void;
}

const sortByDateDesc = (list: Transaction[]) =>
  list.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

export const useTransactionStore = create<TransactionStore>((set)=> ({
    transactions : [],

    loadTransactions: () => {
        const data = getLocal();
        set({transactions : sortByDateDesc(data)});
    },

    addTransaction: (tx) => {
        const newTx =addLocal(tx)
        set((state) => {
        const updated = [newTx, ...state.transactions];
        return { transactions: sortByDateDesc(updated) };
        });
    },

    deleteTransaction: (id) => {
        deleteLocal(id);
        set((state)=>({
            transactions: state.transactions.filter((t)=> t.id !== id)
        }))
    },

    updateTransaction: (tx) => {
        updateTransaction(tx);
        set((state) => {
            const updated = state.transactions.map((t) => t.id === tx.id ? tx : t);
            return { transactions: sortByDateDesc(updated) };
        })
    },
}))