import { useTheme } from "@/src/context/ThemeContext";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
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
import { signIn } from "../../services/authService";
import { createAuthScreenStyles } from "./authScreenStyles";

export default function Login() {
  const { colors, resolved } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const themed = useMemo(
    () => createAuthScreenStyles(colors, resolved),
    [colors, resolved],
  );

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
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
              <Text style={themed.title}>Welcome Back 👋</Text>
              <Text style={themed.subtitle}>Login to continue</Text>

              <TextInput
                style={themed.input}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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

              <TouchableOpacity style={themed.button} onPress={handleLogin}>
                <Text style={themed.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => router.push("/auth/register")}
              >
                <Text style={themed.link}>New user? Create account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
