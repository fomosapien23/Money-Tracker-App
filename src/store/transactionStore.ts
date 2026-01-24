import { create } from "zustand";
import {
    addTransaction as addLocal,
    deleteTransaction as deleteLocal,
    getTransactions as getLocal,
} from "../services/localTransactions";
import { Transaction } from "../type/transaction";

type TransactionStore = {
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
    deleteTransaction: (id: string) => void;
    loadTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set)=> ({
    transactions : [],

    loadTransactions: () => {
        const data = getLocal();
        set({transactions : data});
    },

    addTransaction: (tx) => {
        const newTx =addLocal(tx)
        set((state)=>({
            transactions: [newTx, ...state.transactions]
        }))
    },

    deleteTransaction: (id) => {
        deleteLocal(id);
        set((state)=>({
            transactions: state.transactions.filter((t)=> t.id !== id)
        }))
    },
}))