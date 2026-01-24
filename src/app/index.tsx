import { useTransactionStore } from "@/src/store/transactionStore";
import { useRouter } from "expo-router";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";


export default function Home (){

  const {transactions, addTransaction, deleteTransaction} = useTransactionStore();
    const router = useRouter();

    const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.container}>
        <Text style={styles.heading}>Money Tracker</Text>

        <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>${(totalIncome - totalExpense).toFixed(2)}</Text>    
        </View>

        <View style={styles.row}>
            <View style={[styles.card, styles.incomeCard]}>
                <Text>Income</Text>
                <Text style={styles.amount}>${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={[styles.card, styles.expenseCard]}>
                <Text>Expense</Text>
                <Text style={styles.amount}>${totalExpense.toFixed(2)}</Text>
            </View>
        </View>

        <Button title="➕ Add Transaction" onPress={() => router.push("/add-transaction")} />

          <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Text>{item.title} - {item.amount}</Text>
              <Button
                title="Delete"
                onPress={() => deleteTransaction(item.id)}
              />
              

            </View>
          )}
        />
    </View>


  )

  
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  balanceCard: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  balanceLabel: { color: "#aaa", fontSize: 14 },
  balanceAmount: { color: "#fff", fontSize: 28, fontWeight: "bold" },

  row: { flexDirection: "row", justifyContent: "space-between" },

  card: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  incomeCard: { backgroundColor: "#ddffdd" },
  expenseCard: { backgroundColor: "#ffdddd" },

  amount: { fontSize: 18, fontWeight: "bold" },

  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
  },
});