import { storage } from "@/src/storage/mmkv";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

const PREF_KEY = "theme-preference";
const HAPTICS_KEY = "settings-haptics-enabled";

export type ThemePreference = "system" | "light" | "dark";

export type AppColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryMuted: string;
  danger: string;
  errorSurface: string;
  errorBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  incomeTint: string;
  expenseTint: string;
  /** Border / accent for income summary card */
  incomeAccent: string;
  /** Border / accent for expense summary card */
  expenseAccent: string;
  balanceCardBg: string;
  /** Auth & form fields: input fill */
  inputFill: string;
  /** Muted text for placeholders */
  placeholder: string;
  incomeAmount: string;
  expenseAmount: string;
  /** Transaction list row background */
  listRowBg: string;
};

const lightColors: AppColors = {
  background: "#f5f7fb",
  surface: "#ffffff",
  surfaceMuted: "#f8f9fa",
  text: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  borderStrong: "#d1d5db",
  primary: "#1971C2",
  primaryMuted: "#e7f1fb",
  danger: "#e03131",
  errorSurface: "#fff5f5",
  errorBorder: "#ffc9c9",
  tabBarBg: "#ffffff",
  tabBarBorder: "#e8ecf1",
  incomeTint: "#ddffdd",
  expenseTint: "#ffdddd",
  incomeAccent: "#2b8a3e",
  expenseAccent: "#c92a2a",
  balanceCardBg: "#222222",
  inputFill: "#fafafa",
  placeholder: "#9ca3af",
  incomeAmount: "#2f9e44",
  expenseAmount: "#e03131",
  listRowBg: "#ffffff",
};

const darkColors: AppColors = {
  background: "#0c1220",
  surface: "#161d2e",
  surfaceMuted: "#1e2838",
  text: "#f3f4f6",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  border: "#2d3a50",
  borderStrong: "#4a5a78",
  primary: "#5c9fd6",
  primaryMuted: "#1a3050",
  danger: "#f87171",
  errorSurface: "#2d1a1c",
  errorBorder: "#5c2a2e",
  tabBarBg: "#131b2c",
  tabBarBorder: "#2d3a50",
  incomeTint: "#121c18",
  expenseTint: "#1c1416",
  incomeAccent: "#3d9970",
  expenseAccent: "#e57373",
  balanceCardBg: "#1a2332",
  inputFill: "#1a2332",
  placeholder: "#8b9aad",
  incomeAmount: "#6ee7b7",
  expenseAmount: "#fca5a5",
  listRowBg: "#1a2332",
};

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  resolved: "light" | "dark";
  colors: AppColors;
  hapticsEnabled: boolean;
  setHapticsEnabled: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): ThemePreference {
  const s = storage.getString(PREF_KEY);
  if (s === "light" || s === "dark" || s === "system") return s;
  return "system";
}

function readHaptics(): boolean {
  return storage.getString(HAPTICS_KEY) !== "false";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPrefState] = useState<ThemePreference>(readPreference);
  const [hapticsEnabled, setHapticsState] = useState(readHaptics);

  const setPreference = useCallback((p: ThemePreference) => {
    setPrefState(p);
    storage.set(PREF_KEY, p);
  }, []);

  const setHapticsEnabled = useCallback((v: boolean) => {
    setHapticsState(v);
    storage.set(HAPTICS_KEY, v ? "true" : "false");
  }, []);

  const resolved: "light" | "dark" =
    preference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  const colors = resolved === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      resolved,
      colors,
      hapticsEnabled,
      setHapticsEnabled,
    }),
    [
      preference,
      setPreference,
      resolved,
      colors,
      hapticsEnabled,
      setHapticsEnabled,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
