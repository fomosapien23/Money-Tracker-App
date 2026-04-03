import type { AppColors } from "@/src/context/ThemeContext";
import { StyleSheet } from "react-native";

export function createAuthScreenStyles(
  colors: AppColors,
  resolved: "light" | "dark",
) {
  const isDark = resolved === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.surface,
      margin: 20,
      padding: 25,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.08,
      shadowRadius: isDark ? 16 : 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: isDark ? 8 : 5,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 5,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 25,
      textAlign: "center",
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 15,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputFill,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    link: {
      textAlign: "center",
      color: colors.primary,
      fontWeight: "600",
    },
  });
}
