import { useTransactionStore } from "@/src/store/transactionStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-get-random-values";


export default function RootLayout() {
  const loadTransactions = useTransactionStore((s)=>s.loadTransactions)
  useEffect(()=>{
    loadTransactions()
  },[])
  return <Stack />;
}