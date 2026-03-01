export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

export type TransactionSection = {
  title: string;
  data: Transaction[];
};
