import { useTransactionStore } from "@/src/store/transactionStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Transaction, TransactionSection } from "../../type/transaction";

const groupTransactions  = (transactions: Transaction[]): TransactionSection[] => {
  const sections: any[] = [];
  const grouped: { [key: string]: Transaction[] } = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label = date.toDateString();

    if (date.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (!grouped[label]) {
      grouped[label] = [];
    }

    grouped[label].push(tx);
  });

  return Object.keys(grouped).map((date) => ({
      title: date,
      data: grouped[date],
    }));

};


export default function Home (){

  const {transactions, addTransaction, deleteTransaction} = useTransactionStore();
  const sections = groupTransactions (transactions);
    const router = useRouter();

    const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaProvider style={styles.container} >
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

        <View style={styles.container}>

          {/* 🔥 SCREEN TITLE */}
          <Text style={styles.heading}>
            Transactions
          </Text>

          <SectionList<Transaction>
            sections={sections}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            
            renderSectionHeader={({ section: { title } }) => (
              <Text style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 15,
                marginBottom: 8,
                color: "#555",
              }}>
                {title}
              </Text>
            )}

            renderItem={({ item }) => (
              <View style={{
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}>
                 <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ fontWeight: "500", fontSize: 14, color: "#666" }}>
                        {item.category}
                      </Text>

                      <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>

                    {/* 🔹 Second Row → Title + Amount */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "600", fontSize: 16 }}>
                        {item.title}
                      </Text>

                      <Text
                        style={{
                          fontWeight: "600",
                          fontSize: 16,
                          color: item.type === "income" ? "green" : "red",
                        }}
                      >
                        {item.type === "income" ? "+" : "-"} ₹{item.amount}
                      </Text>
                    </View>

                  </View>
            )}

          />
        </View>
      </SafeAreaProvider>
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