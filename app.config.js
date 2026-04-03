/**
 * When this file exists, Expo uses it instead of evaluating app.json as the config entry.
 * We still load app.json as data and override `extra.aiBackendUrl` from the environment
 * so EAS preview/production can point at a deployed HTTPS backend.
 *
 * Set EXPO_PUBLIC_AI_BACKEND_URL in EAS environment variables, e.g.
 *   https://your-app.vercel.app   (Vercel — no /api suffix; rewrites map / to the function)
 *   https://your-service.up.railway.app
 */
const appJson = require("./app.json");

module.exports = function appConfig() {
  const expo = appJson.expo;
  const fromEnv = process.env.EXPO_PUBLIC_AI_BACKEND_URL?.trim();
  const placeholder =
    "https://REPLACE_WITH_YOUR_DEPLOYED_BACKEND_URL" === fromEnv;

  if (process.env.EAS_BUILD_PROFILE && (!fromEnv || placeholder)) {
    throw new Error(
      "EAS build requires EXPO_PUBLIC_AI_BACKEND_URL: set it under Project → Environment variables " +
        "in expo.dev (or `eas env:create`) to your deployed HTTPS AI API base URL (no trailing slash).",
    );
  }

  const aiBackendUrl =
    fromEnv && !placeholder
      ? fromEnv
      : (expo.extra?.aiBackendUrl ?? "http://localhost:4000");

  return {
    ...expo,
    extra: {
      ...expo.extra,
      aiBackendUrl,
    },
  };
};
