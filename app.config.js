/**
 * Expo merges `app.json` into `config` before calling this export.
 * We override `extra.aiBackendUrl` from the environment for EAS builds.
 *
 * Set EXPO_PUBLIC_AI_BACKEND_URL for EAS (Preview + Production) so the APK/IPA
 * calls your HTTPS backend; otherwise the build falls back to app.json `extra.aiBackendUrl`
 * (default localhost — AI will not work on a real device until you set the var or URL).
 */
module.exports = ({ config }) => {
  const fromEnv = process.env.EXPO_PUBLIC_AI_BACKEND_URL?.trim();
  const placeholder =
    "https://REPLACE_WITH_YOUR_DEPLOYED_BACKEND_URL" === fromEnv;

  const profile = process.env.EAS_BUILD_PROFILE;
  if (profile === "production" && (!fromEnv || placeholder)) {
    throw new Error(
      "Production EAS build requires EXPO_PUBLIC_AI_BACKEND_URL: set it under Project → Environment variables " +
        "in expo.dev (or `eas env:create`) to your deployed HTTPS AI API base URL (no trailing slash).",
    );
  }

  const aiBackendUrl =
    fromEnv && !placeholder
      ? fromEnv
      : (config.extra?.aiBackendUrl ?? "http://localhost:4000");

  return {
    ...config,
    extra: {
      ...config.extra,
      aiBackendUrl,
    },
  };
};
