import { AI_BACKEND_URL } from "../constants/config";

type AiMode = "spending-summary" | "budget-coach" | "saving-advice";

export type AiAnalysisRequest = {
  mode: AiMode;
  period: { from: string; to: string };
  transactionsByCategory: {
    category: string;
    total: number;
    count: number;
    type: "expense" | "income";
  }[];
  currency: string;
};

export type AiAnalysisResponse = {
  summaryText: string;
  bulletPoints: string[];
};

export async function analyzeTransactionsWithAi(
  payload: AiAnalysisRequest,
): Promise<AiAnalysisResponse> {
  let response: Response;
  try {
    response = await fetch(`${AI_BACKEND_URL}/ai/analyze-transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    if (error?.message?.includes("Network request failed")) {
      throw new Error(
        `Cannot reach AI backend at ${AI_BACKEND_URL}. Start backend with 'npm run ai:dev' and ensure phone + PC are on same network.`,
      );
    }
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "AI backend error");
  }

  return response.json();
}

