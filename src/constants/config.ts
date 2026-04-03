import Constants from "expo-constants";
import { NativeModules } from "react-native";

type AppExtra = {
  aiBackendUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;
const configuredAiBackendUrl = extra.aiBackendUrl ?? "http://localhost:4000";

function resolveDevAiBackendUrl(url: string) {
  if (!__DEV__) return url;

  const isLocalhost =
    url.includes("localhost") || url.includes("127.0.0.1") || url.includes("0.0.0.0");

  if (!isLocalhost) return url;

  const hostUri = Constants.expoConfig?.hostUri;
  const hostFromExpoConfig = hostUri?.split(":")[0];

  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  const hostFromScriptUrl = scriptURL?.match(/https?:\/\/([^/:]+)/)?.[1];

  const host = hostFromExpoConfig ?? hostFromScriptUrl;
  if (!host) return url;

  return url
    .replace("localhost", host)
    .replace("127.0.0.1", host)
    .replace("0.0.0.0", host);
}

export const AI_BACKEND_URL = resolveDevAiBackendUrl(configuredAiBackendUrl);

