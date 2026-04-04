import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "@/src/lib/supabase";
import { useTransactionStore } from "@/src/store/transactionStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormErrors {
  title?: string;
  amount?: string;
  date?: string;
  category?: string;
}

export default function EditTransaction() {
  const { colors, resolved } = useTheme();
  const router = useRouter();
  const { transactions, addTransaction, updateTransaction } =
    useTransactionStore();

  const inputThemed = {
    borderColor: colors.borderStrong,
    backgroundColor: colors.inputFill,
    color: colors.text,
  };
  const idtx = useLocalSearchParams();
  const transactionId = Array.isArray(idtx.id) ? idtx.id[0] : idtx.id;
  const [errors, setErrors] = useState<FormErrors>({});

  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setType("expense");
    setDate(new Date());
  };

  const handleSave = async () => {
    if (!title || !amount || !category) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      if (editingTransaction) {
        // ✅ Update existing transaction
        const { error } = await supabase
          .from("transactions")
          .update({
            title,
            amount: parseFloat(amount),
            category,
            type,
            date: date.toISOString(),
          })
          .eq("id", editingTransaction.id);

        if (error) throw error;
      }

      resetForm();
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setEditText(cat.name);
  };

  const handleDelete = async (cat: any) => {
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("categories")
              .delete()
              .eq("id", cat.id);

            if (error) throw error;

            fetchCategories(type);
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not authenticated");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name, type, user_id: user.id, is_default: false }])
        .select();

      if (error) throw error;

      // Set the new category immediately
      if (data && data.length > 0) {
        setCategory(data[0].name);
      }

      setNewCategoryName("");
      setShowAddCategory(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchCategories = async (type: string) => {
    setLoadingCategories(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", type)
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  React.useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) return;

      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", transactionId)
          .single();

        if (error) throw error;

        setEditingTransaction(data);
        setTitle(data.title);
        setAmount(data.amount.toString());
        setCategory(data.category);
        setType(data.type);
        setDate(new Date(data.date));
      } catch (err: any) {
        alert(err.message);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  React.useEffect(() => {
    const fetchAndSetCategories = async () => {
      await fetchCategories(type);
    };
    fetchAndSetCategories();

    if (category != "") {
      const filteredCategories = categories.filter((c) => c.type === type);
      const exists = filteredCategories.some(
        (c) => c.name === editingTransaction.category,
      );

      if (exists) {
        setCategory(editingTransaction.category);
      } else {
        setCategory("");
      }
    }
  }, [type]);

  React.useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setType(editingTransaction.type);
      setDate(new Date(editingTransaction.date));
      setEditText(editingTransaction.category);
    }
  }, [editingTransaction]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.text }]}>
          {"Update Transaction"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput
        style={[
          styles.input,
          inputThemed,
          errors.title && { borderColor: colors.errorBorder },
        ]}
        placeholder="Title (e.g., Salary, Groceries)"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.placeholder}
        cursorColor={colors.primary}
        selectionColor={colors.primary}
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={[
          styles.input,
          inputThemed,
          errors.amount && { borderColor: colors.errorBorder },
        ]}
        placeholder="Amount (e.g., 500, 20.75)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor={colors.placeholder}
        cursorColor={colors.primary}
        selectionColor={colors.primary}
        underlineColorAndroid="transparent"
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            { borderColor: colors.borderStrong },
            type === "expense" && {
              backgroundColor: colors.expenseTint,
              borderColor: colors.expenseAccent,
            },
          ]}
          onPress={() => setType("expense")}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            { borderColor: colors.borderStrong },
            type === "income" && {
              backgroundColor: colors.incomeTint,
              borderColor: colors.incomeAccent,
            },
          ]}
          onPress={() => setType("income")}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>Income</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.inlineInput,
          { borderColor: colors.borderStrong, backgroundColor: colors.inputFill },
        ]}
        onPress={() => setShowCategoryDropdown((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={[styles.inlineLabel, { color: colors.textSecondary }]}>
          Category
        </Text>

        <View style={styles.inlineValueContainer}>
          <Text
            style={[
              styles.inlineValue,
              { color: category ? colors.text : colors.placeholder },
            ]}
          >
            {category || "Select"}
          </Text>
          <Text style={[styles.arrow, { color: colors.textMuted }]}>▼</Text>
        </View>
      </TouchableOpacity>

      {showCategoryDropdown && (
        <View style={styles.dropdownRoot}>
          {/* Backdrop */}
          <TouchableWithoutFeedback
            onPress={() => setShowCategoryDropdown(false)}
          >
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Dropdown */}
          <View
            style={[
              styles.popup,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderStrong,
              },
            ]}
          >
            <ScrollView
              style={{ maxHeight: 250 }}
              keyboardShouldPersistTaps="handled"
            >
              {categories.map((c) => (
                <View
                  key={c.id}
                  style={[styles.categoryRow, { borderBottomColor: colors.border }]}
                >
                  {/* Select Category */}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      setCategory(c.name);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={[styles.popupText, { color: colors.text }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Icons */}
                  {c.isCustom && (
                    <View style={styles.iconContainer}>
                      {/* Edit */}
                      <TouchableOpacity onPress={() => handleEdit(c)}>
                        <Text style={styles.editIcon}>✏️</Text>
                      </TouchableOpacity>

                      {/* Delete */}
                      <TouchableOpacity onPress={() => handleDelete(c)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.popupItem,
                  styles.addNewItem,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setShowCategoryDropdown(false);
                  setShowAddCategory(true);
                }}
              >
                <Text style={[styles.addNewText, { color: colors.primary }]}>
                  ➕ Add new category
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      <Modal visible={showAddCategory} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowAddCategory(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ width: "100%" }}
              >
                <View
                  style={[styles.modalBox, { backgroundColor: colors.surface }]}
                >
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Add Category
                  </Text>

                  <TextInput
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Category name"
                    style={[styles.input, inputThemed]}
                    placeholderTextColor={colors.placeholder}
                    cursorColor={colors.primary}
                    selectionColor={colors.primary}
                    underlineColorAndroid="transparent"
                  />

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAddCategory}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TouchableOpacity
        style={[
          styles.dateBtn,
          {
            borderColor: colors.borderStrong,
            backgroundColor: colors.inputFill,
          },
          errors.date && { borderColor: colors.errorBorder },
        ]}
        onPress={() => setShowDate(true)}
      >
        <Text style={{ color: colors.text, fontSize: 16 }}>
          {date.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event: any, selectedDate: any) => {
            setShowDate(false);
            if (selectedDate) setDate(selectedDate);
          }}
          {...(Platform.OS === "ios"
            ? {
                themeVariant: resolved === "dark" ? ("dark" as const) : ("light" as const),
                textColor: colors.text,
                accentColor: colors.primary,
              }
            : {})}
        />
      )}
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Update Transaction</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
  row: { flexDirection: "row", marginBottom: 15 },
  typeBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 8,
  },
  dateBtn: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalBox: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  inlineInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },

  inlineLabel: {
    fontSize: 14,
    width: 90, // 👈 keeps alignment clean
  },

  inlineValueContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inlineValue: {
    fontSize: 16,
  },

  arrow: {
    fontSize: 12,
  },

  popup: {
    position: "absolute",
    top: 250, // 👈 adjust if needed
    left: 20,
    right: 20,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
  },

  popupItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  popupText: {
    fontSize: 16,
  },

  addNewItem: {},

  addNewText: {
    fontSize: 16,
    fontWeight: "600",
  },

  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  dropdownRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* =========================
     Category Row (Edit/Delete)
  ========================== */

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },

  categoryName: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  editIcon: {
    fontSize: 18,
    marginRight: 12,
  },

  deleteIcon: {
    fontSize: 18,
    color: "red",
  },

  /* =========================
     Edit Category Modal
  ========================== */

  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },

  editBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },

  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  editInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
