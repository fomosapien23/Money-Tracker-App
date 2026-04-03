import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signUp } from "../../services/authService";
import { createAuthScreenStyles } from "./authScreenStyles";

export default function Register() {
  const router = useRouter();
  const { colors, resolved } = useTheme();
  const themed = useMemo(
    () => createAuthScreenStyles(colors, resolved),
    [colors, resolved],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert("Success", "Signup successful!");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[themed.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={themed.card}>
              <Text style={themed.title}>Create Account 🚀</Text>
              <Text style={themed.subtitle}>Sign up to get started</Text>

              <TextInput
                style={themed.input}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                cursorColor={colors.primary}
                selectionColor={colors.primary}
                underlineColorAndroid="transparent"
              />

              <TextInput
                style={themed.input}
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                cursorColor={colors.primary}
                selectionColor={colors.primary}
                underlineColorAndroid="transparent"
              />

              <TouchableOpacity
                style={[themed.button, loading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={themed.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => router.push("/auth/login")}
              >
                <Text style={themed.link}>
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
