/**
 * Expo merges `app.json` into `config` before calling this export.
 *
 * - Local `expo start`: uses app.json `extra.aiBackendUrl` (localhost → rewritten in dev).
 * - EAS builds: uses `EXPO_PUBLIC_AI_BACKEND_URL` if set, else `ai-backend.url.json` `baseUrl`,
 *   else falls back to app.json.
 *
 * Edit `ai-backend.url.json` to match your deployed backend (no trailing slash).
 */
const path = require("path");

function readDeployedBaseUrl() {
  try {
    const { baseUrl } = require(path.join(__dirname, "ai-backend.url.json"));
    return typeof baseUrl === "string" ? baseUrl.trim().replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

function badProductionAiUrl(url) {
  return (
    !url ||
    url.startsWith("http://localhost") ||
    url.startsWith("http://127.0.0.1") ||
    !url.startsWith("https://")
  );
}

module.exports = ({ config }) => {
  const fromEnv = process.env.EXPO_PUBLIC_AI_BACKEND_URL?.trim();
  const placeholder =
    "https://REPLACE_WITH_YOUR_DEPLOYED_BACKEND_URL" === fromEnv;

  const profile = process.env.EAS_BUILD_PROFILE;
  const onEas = Boolean(process.env.EAS_BUILD || profile);

  const fromFile = onEas ? readDeployedBaseUrl() : "";

  if (onEas && !(fromEnv && !placeholder) && !fromFile) {
    throw new Error(
      "EAS build: set a real AI backend URL. Either set EXPO_PUBLIC_AI_BACKEND_URL in Expo env, " +
        "or set baseUrl in ai-backend.url.json to the URL from Vercel (Project → Settings → Domains). " +
        "The name is not your package.json name — deploy backend/ first (Vercel Root Directory: backend), then paste that https://….vercel.app URL.",
    );
  }

  const aiBackendUrl = (() => {
    if (fromEnv && !placeholder) return fromEnv.replace(/\/+$/, "");
    if (fromFile) return fromFile;
    const fallback = config.extra?.aiBackendUrl ?? "http://localhost:4000";
    return String(fallback).trim().replace(/\/+$/, "") || "http://localhost:4000";
  })();

  if (profile === "production" && badProductionAiUrl(aiBackendUrl)) {
    throw new Error(
      "Production EAS build needs an https AI backend URL: set EXPO_PUBLIC_AI_BACKEND_URL " +
        "or set `baseUrl` in ai-backend.url.json to your deployed API (no trailing slash).",
    );
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      aiBackendUrl,
    },
  };
};
