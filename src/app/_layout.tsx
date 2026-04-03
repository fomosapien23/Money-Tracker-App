import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthProvider";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

function RootNavigation() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!session && !inAuthGroup) {
      router.replace("../auth/login");
    }

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

function ThemedNavigationShell({ children }: { children: ReactNode }) {
  const { colors, resolved } = useTheme();

  const navigationTheme = useMemo(
    () => ({
      ...(resolved === "dark" ? DarkTheme : DefaultTheme),
      colors: {
        ...(resolved === "dark" ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.danger,
      },
    }),
    [resolved, colors],
  );

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  return (
    <>
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <NavigationThemeProvider value={navigationTheme}>
        {children}
      </NavigationThemeProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedNavigationShell>
            <RootNavigation />
          </ThemedNavigationShell>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
