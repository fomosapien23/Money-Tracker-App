import {
  type AppColors,
  type ThemePreference,
  useTheme,
} from "@/src/context/ThemeContext";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const APP_VERSION =
  Constants.expoConfig?.version ??
  Constants.nativeAppVersion ??
  "1.0.0";

export default function Settings() {
  const router = useRouter();
  const {
    colors,
    preference,
    setPreference,
    hapticsEnabled,
    setHapticsEnabled,
  } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const scrollBottomPad = Math.max(tabBarHeight, 60 + safeBottom) + 24;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const feedbackHaptic = () => {
    if (hapticsEnabled) {
      Haptics.selectionAsync();
    }
  };

  const onPickTheme = (p: ThemePreference) => {
    feedbackHaptic();
    setPreference(p);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const openFeedback = () => {
    const subject = encodeURIComponent("Money app feedback");
    const body = encodeURIComponent(`\n\n— App v${APP_VERSION}`);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`).catch(() =>
      Alert.alert(
        "Email unavailable",
        "No mail app found. You can reach out from your device’s browser.",
      ),
    );
  };

  const styles = themedStyles(colors);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const themeOptions: { key: ThemePreference; label: string; hint: string }[] = [
    { key: "system", label: "System", hint: "Match device setting" },
    { key: "light", label: "Light", hint: "Always light" },
    { key: "dark", label: "Dark", hint: "Always dark" },
  ];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>
          Appearance, feedback, and your account
        </Text>

        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          {themeOptions.map((opt) => {
            const selected = preference === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => onPickTheme(opt.key)}
                style={({ pressed }) => [
                  styles.themeRow,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={styles.themeRowLeft}>
                  <View
                    style={[
                      styles.radioOuter,
                      selected && { borderColor: colors.primary },
                    ]}
                  >
                    {selected ? (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.themeTextBlock}>
                    <Text style={styles.rowTitle}>{opt.label}</Text>
                    <Text style={styles.rowHint}>{opt.hint}</Text>
                  </View>
                </View>
                {opt.key === "system" ? (
                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                ) : opt.key === "light" ? (
                  <Ionicons
                    name="sunny-outline"
                    size={22}
                    color={colors.textMuted}
                  />
                ) : (
                  <Ionicons
                    name="moon-outline"
                    size={20}
                    color={colors.textMuted}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <Text style={styles.rowTitle}>Haptic feedback</Text>
              <Text style={styles.rowHint}>
                Light taps when choosing theme and toggles
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(v) => {
                if (v) Haptics.selectionAsync();
                setHapticsEnabled(v);
              }}
              trackColor={{
                false: colors.borderStrong,
                true: colors.primaryMuted,
              }}
              thumbColor={hapticsEnabled ? colors.primary : colors.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => {
              feedbackHaptic();
              openFeedback();
            }}
            style={({ pressed }) => [
              styles.linkRow,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={22}
              color={colors.primary}
              style={styles.linkIcon}
            />
            <View style={styles.linkTextWrap}>
              <Text style={styles.rowTitle}>Send feedback</Text>
              <Text style={styles.rowHint}>Opens your email app</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            onPress={() => {
              feedbackHaptic();
              Alert.alert(
                "Privacy",
                "We store your transactions in your Supabase project under your account. Review your provider’s privacy policy for how data is handled.",
              );
            }}
            style={({ pressed }) => [
              styles.linkRow,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={colors.primary}
              style={styles.linkIcon}
            />
            <View style={styles.linkTextWrap}>
              <Text style={styles.rowTitle}>Privacy</Text>
              <Text style={styles.rowHint}>How data is used</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.rowTitle}>Version</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Text style={[styles.rowHint, { paddingHorizontal: 16, paddingTop: 14 }]}>
            Signed in as
          </Text>
          <Text style={styles.emailValue}>{user?.email ?? "—"}</Text>
          <Text style={styles.userIdHint}>User ID</Text>
          <Text style={styles.userId} numberOfLines={1} ellipsizeMode="middle">
            {user?.id ?? "—"}
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function themedStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    screenSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
      lineHeight: 22,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 10,
      marginTop: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 4,
      marginBottom: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
    },
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    themeRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    themeTextBlock: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    rowHint: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 12,
    },
    switchLabelBlock: {
      flex: 1,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    linkIcon: {
      marginRight: 12,
    },
    linkTextWrap: {
      flex: 1,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: 50,
    },
    aboutRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    aboutValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
    emailValue: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
      marginTop: 6,
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    userIdHint: {
      paddingHorizontal: 16,
      marginTop: 12,
      fontSize: 13,
      color: colors.textSecondary,
    },
    userId: {
      fontSize: 12,
      color: colors.textMuted,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: colors.danger,
      paddingVertical: 16,
      borderRadius: 14,
      marginBottom: 16,
    },
    logoutText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
  });
}
