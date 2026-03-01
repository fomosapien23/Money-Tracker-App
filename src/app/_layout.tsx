import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthProvider";

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

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
