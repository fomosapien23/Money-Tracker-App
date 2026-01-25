import { useTransactionStore } from "@/src/store/transactionStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";


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
            <Text style={styles.balanceAmount}>₹ {(totalIncome - totalExpense).toFixed(2)}</Text>    
        </View>

        <View style={styles.row}>
            <View style={[styles.card, styles.incomeCard]}>
                <Text>Income</Text>
                <Text style={styles.amount}>₹ {totalIncome.toFixed(2)}</Text>
            </View>
            <View style={[styles.card, styles.expenseCard]}>
                <Text>Expense</Text>
                <Text style={styles.amount}>₹ {totalExpense.toFixed(2)}</Text>
            </View>
        </View>

        {/* <Button title="➕ Add Transaction" onPress={() => router.push("/add")} /> */}

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{...styles.txContainer}}>
              <View>
                <Text style={styles.txRowHeader}>
                  {item.date.toString().slice(8, 10)}
                </Text>
              </View>
              <View style={styles.txContentRow}>
                <View style={styles.txTextContainer}>
                  <Text
                    style={styles.txSingleLine}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    <Text style={styles.txCategory}>{item.category} </Text>
                    <Text >{item.title} </Text>
                    <Text >₹{item.amount} </Text>
                  </Text>
                </View>

                <Ionicons name="trash" size={20} color="red"
                  title="Delete"
                  onPress={() => deleteTransaction(item.id)}
                />
              </View>
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

  txRowHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  txContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  txContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  txTextContainer: {
    flex: 1,       
    marginRight: 10,
  },

  txSingleLine: {
    fontSize: 14,
  },

  txCategory: {
    fontWeight: "bold",
  },

});