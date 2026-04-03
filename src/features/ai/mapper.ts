import type { AiAnalysisRequest } from "@/src/services/aiService";
import type { Transaction } from "@/src/type/transaction";
import type {
    BuildAiRequestParams,
    DateRange,
    FilterTransactionsParams,
    TimeFilter,
    TransactionByCategory,
} from "./types";

export function getDateRangeForFilter(
  filterType: TimeFilter,
  selectedDate: Date,
): DateRange {
  const now = new Date();

  if (filterType === "monthly") {
    const from = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    );
    const to = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0,
    );
    return { from, to };
  }

  if (filterType === "yearly") {
    return {
      from: new Date(selectedDate.getFullYear(), 0, 1),
      to: new Date(selectedDate.getFullYear(), 11, 31),
    };
  }

  const to = now;
  const from = new Date();
  from.setDate(now.getDate() - 30);
  return { from, to };
}

export function filterTransactionsByTime({
  transactions,
  filterType,
  selectedDate,
}: FilterTransactionsParams): Transaction[] {
  return transactions.filter((transaction) => {
    const txDate = new Date(transaction.date);

    if (filterType === "monthly") {
      return (
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }

    if (filterType === "yearly") {
      return txDate.getFullYear() === selectedDate.getFullYear();
    }

    return true;
  });
}

export function groupTransactionsByCategory(
  transactions: Transaction[],
): TransactionByCategory[] {
  const byCategoryMap: Record<
    string,
    { total: number; count: number; type: "expense" | "income" }
  > = {};

  transactions.forEach((transaction) => {
    const key = `${transaction.type}:${transaction.category}`;
    if (!byCategoryMap[key]) {
      byCategoryMap[key] = {
        total: 0,
        count: 0,
        type: transaction.type,
      };
    }

    byCategoryMap[key].total += transaction.amount;
    byCategoryMap[key].count += 1;
  });

  return Object.entries(byCategoryMap).map(([key, value]) => {
    const [, category] = key.split(":");
    return {
      category,
      total: value.total,
      count: value.count,
      type: value.type,
    };
  });
}

export function mapToAiAnalysisRequest({
  mode,
  transactions,
  period,
  currency,
}: BuildAiRequestParams): AiAnalysisRequest {
  return {
    mode,
    period: {
      from: period.from.toISOString().split("T")[0],
      to: period.to.toISOString().split("T")[0],
    },
    transactionsByCategory: groupTransactionsByCategory(transactions),
    currency,
  };
}
