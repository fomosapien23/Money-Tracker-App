import { analyzeTransactionsWithAi } from "@/src/services/aiService";
import type { Transaction } from "@/src/type/transaction";
import { useState } from "react";
import { mapToAiAnalysisRequest } from "./mapper";
import type { AiMode, CurrencyCode, DateRange } from "./types";

export function useAiInsights() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    summaryText: string;
    bulletPoints: string[];
  } | null>(null);

  const askAi = async ({
    mode,
    transactions,
    period,
    currency = "INR",
  }: {
    mode: AiMode;
    transactions: Transaction[];
    period: DateRange;
    currency?: CurrencyCode;
  }) => {
    if (transactions.length === 0) {
      setAiError("Add some transactions first to get AI insights.");
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);

      const payload = mapToAiAnalysisRequest({
        mode,
        transactions,
        period,
        currency,
      });

      const response = await analyzeTransactionsWithAi(payload);
      setAiResult(response);
    } catch (error) {
      console.error(error);
      setAiError(
        error instanceof Error
          ? error.message
          : "Unable to get AI insights right now. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiLoading,
    aiError,
    aiResult,
    askAi,
  };
}
