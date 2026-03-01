import { useCategoryStore } from "@/src/store/categoryStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Button,
    Keyboard,
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
import { useTransactionStore } from "../../store/transactionStore";

export default function AddTransaction() {
  const router = useRouter();
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const {
    expenseCategories,
    incomeCategories,
    loadCategories,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();
  const categories = type === "income" ? incomeCategories : expenseCategories;
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editText, setEditText] = useState("");

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setType("expense");
    setDate(new Date());
  };

  const handleSave = () => {
    if (!title || !amount || !category) {
      alert("Please fill all fields");
      return;
    }

    addTransaction({
      title,
      amount: parseFloat(amount),
      category,
      type,
      date: date.toISOString(),
    });
    resetForm();
    router.back();
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setEditText(cat.name);
  };

  const handleDelete = (cat: any) => {
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteCategory(cat.id),
      },
    ]);
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

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

      {editingCategory && (
        <Modal visible={showAddCategory} transparent animationType="fade">
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setShowAddCategory(false);
            }}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={{ width: "100%" }}
                >
                  <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>Add Category</Text>

                    <TextInput
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      placeholder="Category name"
                      style={styles.input}
                    />

                    <Button
                      title="Add"
                      onPress={() => {
                        const name = newCategoryName.trim();
                        if (!name) return;

                        const exists = categories.some(
                          (c) => c.name.toLowerCase() === name.toLowerCase(),
                        );

                        if (exists) {
                          alert("Category already exists");
                          return;
                        }

                        useCategoryStore.getState().addCategory(name, type);

                        setPendingCategory(name);
                        setNewCategoryName("");
                        setShowAddCategory(false);
                      }}
                    />
                  </View>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

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
        <TouchableWithoutFeedback onPress={() => setShowAddCategory(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Add Category</Text>

                <TextInput
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Category name"
                  style={styles.input}
                />

                <Button
                  title="Add"
                  onPress={() => {
                    const name = newCategoryName.trim();
                    if (!name) return;

                    const exists = categories.some(
                      (c) => c.name.toLowerCase() === name.toLowerCase(),
                    );

                    if (exists) {
                      alert("Category already exists");
                      return;
                    }

                    useCategoryStore.getState().addCategory(name, type);

                    setPendingCategory(name);
                    setNewCategoryName("");
                    setShowAddCategory(false);
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "white",
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
});
