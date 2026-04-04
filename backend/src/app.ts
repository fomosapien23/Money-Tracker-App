import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";

dotenv.config();

const transactionByCategorySchema = z.object({
  category: z.string().min(1),
  total: z.number().nonnegative(),
  count: z.number().int().nonnegative(),
  type: z.enum(["expense", "income"]),
});

const analyzeRequestSchema = z.object({
  mode: z.enum(["spending-summary", "budget-coach", "saving-advice"]),
  period: z.object({
    from: z.string().min(1),
    to: z.string().min(1),
  }),
  transactionsByCategory: z.array(transactionByCategorySchema).min(1),
  currency: z.string().min(1),
});

const aiResponseSchema = z.object({
  summaryText: z.string(),
  bulletPoints: z.array(z.string()),
});

const openrouterApiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.AI_MODEL ?? "nvidia/nemotron-3-nano-30b-a3b";

if (!openrouterApiKey) {
  throw new Error("Missing OPENROUTER_API_KEY in backend environment");
}

function getModeInstruction(mode: string) {
  if (mode === "budget-coach") {
    return "Give practical budget coaching with clear category limits.";
  }
  if (mode === "saving-advice") {
    return "Focus on realistic saving actions user can start this week.";
  }
  return "Provide a concise spending summary with top takeaways.";
}

export const app = express();

// Vercel serves this app under /api/*; normalize so routes stay /health, /ai/..., etc.
app.use((req, _res, next) => {
  const raw = req.url ?? "/";
  const q = raw.indexOf("?");
  const pathOnly = q >= 0 ? raw.slice(0, q) : raw;
  const search = q >= 0 ? raw.slice(q) : "";
  if (pathOnly === "/api" || pathOnly.startsWith("/api/")) {
    const nextPath = pathOnly.replace(/^\/api/, "") || "/";
    (req as { url: string }).url = nextPath + search;
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.send("Backend working");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/ai/analyze-transactions", async (req, res) => {
  const parseResult = analyzeRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid request payload",
      details: parseResult.error.flatten(),
    });
  }

  const payload = parseResult.data;
  const prompt = [
    "You are a personal finance assistant.",
    getModeInstruction(payload.mode),
    `Analyze spending period: ${payload.period.from} to ${payload.period.to}.`,
    `Currency: ${payload.currency}.`,
    "Data by category:",
    JSON.stringify(payload.transactionsByCategory),
    'Return only strict JSON with keys: {"summaryText": string, "bulletPoints": string[]}.',
    "Bullet points should be short and actionable.",
  ].join("\n");

  try {
    const aiHttpResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a careful finance coach. Do not provide legal or investment guarantees.",
            },
            { role: "user", content: prompt },
          ],
        }),
      },
    );

    if (!aiHttpResponse.ok) {
      const errorText = await aiHttpResponse.text();
      console.error("OpenRouter error FULL:", {
        status: aiHttpResponse.status,
        statusText: aiHttpResponse.statusText,
        body: errorText,
      });
      return res.status(502).json({
        error: "OpenRouter request failed",
      });
    }

    const completion = (await aiHttpResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    const parsed = aiResponseSchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
      return res.status(502).json({
        error: "AI returned invalid response format",
      });
    }

    return res.json(parsed.data);
  } catch (error) {
    console.error("AI analyze error", error);
    return res.status(500).json({
      error: "Failed to analyze transactions",
    });
  }
});
