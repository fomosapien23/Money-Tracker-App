import type { Transaction } from "@/src/type/transaction";

export type TimeFilter = "overall" | "monthly" | "yearly";
export type CurrencyCode = "INR" | "USD" | "EUR";

export type AiMode = "spending-summary" | "budget-coach" | "saving-advice";

export type DateRange = {
  from: Date;
  to: Date;
};

export type DateRangePayload = {
  from: string;
  to: string;
};

export type TransactionByCategory = {
  category: string;
  total: number;
  count: number;
  type: "expense" | "income";
};

export type FilterTransactionsParams = {
  transactions: Transaction[];
  filterType: TimeFilter;
  selectedDate: Date;
};

export type BuildAiRequestParams = {
  mode: AiMode;
  transactions: Transaction[];
  period: DateRange;
  currency: CurrencyCode;
};
