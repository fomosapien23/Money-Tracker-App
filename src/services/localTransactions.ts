import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { storage } from "../storage/mmkv";

export type Transaction ={
    id: string,
    title: string,
    amount: number,
    type: 'income' | 'expense',
    category: string,
    date: string
}

const KEY = "transactions"

export const getTransactions = (): Transaction[] => {
    const data =storage.getString(KEY)
    return data ? JSON.parse(data) : []
}


export const addTransaction = (tx : Omit<Transaction, 'id' | 'date'>) => {
    const list = getTransactions();

    const newTx: Transaction ={
        id: uuidv4(),
        date: new Date().toISOString(),
        ...tx
    }

    list.unshift(newTx)
    storage.set(KEY, JSON.stringify(list))
    return newTx;
}

export const deleteTransaction = (id: string) => {
    const list = getTransactions().filter((t)=> t.id !=id)
    storage.set(KEY, JSON.stringify(list))
}

