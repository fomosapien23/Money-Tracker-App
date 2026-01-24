import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTransactionStore } from "../store/transactionStore";


export default function AddTransaction() {
    const router = useRouter();
    const addTransaction = useTransactionStore((s)=>s.addTransaction);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");

    const handleSave = () =>{
        if(!title || !amount || !category) {
            alert("Please fill all fields");
            return;
        }

        addTransaction({
            title,
            amount: parseFloat(amount),
            category,
            type
        });
        router.back();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Transaction</Text>

            <TextInput
            style={styles.input}
            placeholder="Title (e.g., Salary, Groceries)"
            value={title}
            onChangeText={setTitle}
            />

            <TextInput
            style={styles.input}
            placeholder="Amount (e.g., 500, 20.75)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
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
            
            <TextInput
            style={styles.input}
            placeholder="Category (e.g., Food, Rent)"
            value={category}
            onChangeText={setCategory}
            />
            <Button title="Save Transaction" onPress={handleSave} />
        </View>
    )

}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
});