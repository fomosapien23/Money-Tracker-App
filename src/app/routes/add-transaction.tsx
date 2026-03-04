import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Button,
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

export default function AddTransaction() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
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

      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          title,
          amount: parseFloat(amount),
          category,
          type,
          date: date.toISOString(),
        },
      ]);

      if (error) throw error;

      resetForm();
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: editText })
        .eq("id", editingCategory.id);

      if (error) throw error;
      setEditingCategory(null);
      setEditText("");
      setShowAddCategory(false);
      fetchCategories();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
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

            fetchCategories();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  React.useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

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
      Alert.alert("Error", err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("User not authenticated");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            name,
            type,
            user_id: user.id,
            is_default: false,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setCategory(data[0].name);
      }

      fetchCategories();
      setNewCategoryName("");
      setShowAddCategory(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  React.useEffect(() => {
    setCategory("");
  }, [type]);

  React.useEffect(() => {
    if (!pendingCategory) return;

    const found = categories.find(
      (c) => c.name.toLowerCase() === pendingCategory.toLowerCase(),
    );

    if (found) {
      setCategory(found.name);
      setPendingCategory(null);
    }
  }, [categories, pendingCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{"Add Transaction"}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Title (e.g., Salary, Groceries)"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Amount (e.g., 500, 20.75)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.typeBtn, type === "expense" && styles.activeExpense]}
          onPress={() => setType("expense")}
        >
          <Text>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === "income" && styles.activeIncome]}
          onPress={() => setType("income")}
        >
          <Text>Income</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.inlineInput}
        onPress={() => setShowCategoryDropdown((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.inlineLabel}>Category</Text>

        <View style={styles.inlineValueContainer}>
          <Text style={[styles.inlineValue, !category && { color: "#999" }]}>
            {category || "Select"}
          </Text>
          <Text style={styles.arrow}>▼</Text>
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
          <View style={styles.popup}>
            <ScrollView
              style={{ maxHeight: 250 }}
              keyboardShouldPersistTaps="handled"
            >
              {categories.map((c) => (
                <View key={c.id} style={styles.categoryRow}>
                  {/* Select Category */}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      setCategory(c.name);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.popupText}>{c.name}</Text>
                  </TouchableOpacity>

                  {/* Icons */}
                  {!c.is_default && (
                    <View style={styles.iconContainer}>
                      {/* Edit */}
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCategory(c);
                          setEditText(c.name);
                          setShowAddCategory(true);
                        }}
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={20}
                          color="#ff8800"
                          style={styles.editIcon}
                        />
                      </TouchableOpacity>

                      {/* Delete */}
                      <TouchableOpacity onPress={() => handleDelete(c)}>
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#044896"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.popupItem, styles.addNewItem]}
                onPress={() => {
                  setShowCategoryDropdown(false);
                  setShowAddCategory(true);
                }}
              >
                <Text style={styles.addNewText}>➕ Add new category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      <Modal visible={showAddCategory} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setShowAddCategory(false);
              setEditingCategory(null);
            }}
          >
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.centeredModal}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Edit Category" : "Add Category"}
            </Text>

            <TextInput
              value={editingCategory ? editText : newCategoryName}
              onChangeText={(text) =>
                editingCategory ? setEditText(text) : setNewCategoryName(text)
              }
              placeholder="Category name"
              style={styles.input}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  editingCategory ? handleUpdateCategory : handleAddCategory
                }
              >
                <Text style={styles.saveBtn}>
                  {editingCategory ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDate(true)}
      >
        <Text>{date.toDateString()}</Text>
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
        />
      )}
      <Button title="Save Transaction" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
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
  inputError: {
    borderColor: "red",
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
  activeExpense: { backgroundColor: "#ffdddd" },
  activeIncome: { backgroundColor: "#ddffdd" },
  dateBtn: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  inlineInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },

  inlineLabel: {
    fontSize: 14,
    color: "#555",
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
    color: "#000",
  },

  arrow: {
    fontSize: 12,
    color: "#555",
  },

  popup: {
    position: "absolute",
    top: 250, // 👈 adjust if needed
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 1000,
    elevation: 5,
  },

  popupItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  popupText: {
    fontSize: 16,
  },

  addNewItem: {
    backgroundColor: "#f7f7f7",
  },

  addNewText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
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
    borderBottomColor: "#eee",
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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  centeredModal: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  cancelBtn: {
    fontSize: 16,
    color: "#888",
  },

  saveBtn: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
