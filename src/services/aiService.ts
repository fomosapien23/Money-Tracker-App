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
      const lanOrLocal =
        /localhost|127\.0\.0\.1|192\.168\.|10\.\d+\.|172\.(1[6-9]|2\d|3[01])\./i.test(
          AI_BACKEND_URL,
        );
      const hint = __DEV__
        ? "Start backend with `npm run ai:dev` (from repo root) and use the same Wi‑Fi, or set EXPO_PUBLIC_AI_BACKEND_URL in `.env` to your HTTPS API."
        : lanOrLocal
          ? "This build is pointing at a local/LAN URL. Rebuild with EXPO_PUBLIC_AI_BACKEND_URL set to your public HTTPS backend (e.g. Vercel) in EAS environment variables."
          : "Check that the AI backend is deployed and reachable.";
      throw new Error(`Cannot reach AI backend at ${AI_BACKEND_URL}. ${hint}`);
    }
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "AI backend error");
  }

  return response.json();
}

