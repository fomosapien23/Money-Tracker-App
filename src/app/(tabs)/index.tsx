import { useTheme } from "@/src/context/ThemeContext";
import { useTransactions } from "@/src/hooks/useTransactions";
import { deleteTransaction } from "@/src/services/transactionService";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Transaction } from "../../type/transaction";

const groupTransactions = (transactions: Transaction[]) => {
  const grouped: { [key: string]: Transaction[] } = {};

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  transactions.forEach((tx) => {
    const date = new Date(tx.date);

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

export default function Home() {
  const { colors } = useTheme();
  const { transactions, reload } = useTransactions();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const listBottomPad =
    Math.max(tabBarHeight, 60 + safeBottom) + 16;

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const sections = groupTransactions(transactions);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>
          {"Money Tracker"}
        </Text>
      </View>

      <View style={[styles.balanceCard, { backgroundColor: colors.balanceCardBg }]}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          ₹ {(totalIncome - totalExpense).toFixed(2)}
        </Text>
      </View>

      <View style={styles.row}>
        <View
          style={[
            styles.card,
            styles.summaryCard,
            {
              backgroundColor: colors.incomeTint,
              marginRight: 8,
              borderLeftColor: colors.incomeAccent,
            },
          ]}
        >
          <Text
            style={[styles.summaryLabel, { color: colors.textSecondary }]}
          >
            Income
          </Text>
          <Text style={[styles.amount, { color: colors.incomeAmount }]}>
            ₹ {totalIncome.toFixed(2)}
          </Text>
        </View>
        <View
          style={[
            styles.card,
            styles.summaryCard,
            {
              backgroundColor: colors.expenseTint,
              borderLeftColor: colors.expenseAccent,
            },
          ]}
        >
          <Text
            style={[styles.summaryLabel, { color: colors.textSecondary }]}
          >
            Expense
          </Text>
          <Text style={[styles.amount, { color: colors.expenseAmount }]}>
            ₹ {totalExpense.toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={[styles.transactionsTitle, { color: colors.text }]}>
        Transactions
      </Text>

      <SectionList<Transaction>
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPad },
        ]}
        sections={sections}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginTop: 15,
              marginBottom: 8,
              color: colors.textSecondary,
            }}
          >
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: colors.listRowBg,
              padding: 14,
              borderRadius: 12,
              marginBottom: 8,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
            }}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/edit/[id]",
                params: { id: item.id },
              })
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                {item.category}
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await deleteTransaction(item.id);
                  reload(); // refresh from DB
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  color:
                    item.type === "income"
                      ? colors.incomeAmount
                      : colors.expenseAmount,
                }}
              >
                {item.type === "income" ? "+" : "-"} ₹{item.amount}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No transactions yet
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
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
  transactionsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 15,
  },

  balanceCard: {
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
  },
  summaryCard: {
    borderLeftWidth: 3,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

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
