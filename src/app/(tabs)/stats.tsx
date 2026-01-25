import { useTransactionStore } from "@/src/store/transactionStore";
import { Dimensions, ScrollView, Text } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";


export default function Stats() {

  const {transactions} = useTransactionStore();
  const screenWidth = Dimensions.get("window").width;

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
    const pieData = [
    {
      name: "Income",
      amount: income,
      color: "green",
      legendFontColor: "#000",
      legendFontSize: 14,
    },
    {
      name: "Expense",
      amount: expense,
      color: "red",
      legendFontColor: "#000",
      legendFontSize: 14,
    },
  ];

  const monthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun","july", "Aug", "Sep", "Oct", "Nov", "Dec" ],
    datasets: [
      {
        data: [500, 3000, 600, 1200, 600, 500, 800, 600, 1200, 900, 200, 2500,  2300],
      },
    ],
  };
  
  return (
    <ScrollView>
      <Text>Stats Screen</Text>

      <Text>Income vs Expenses</Text>

      <PieChart
      data={pieData}
      width={screenWidth - 40}
      height={220}
      chartConfig={{
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
      }}
      accessor={"amount"}
      backgroundColor={"transparent"}
      paddingLeft={"15"}
      />

      <LineChart
      data={monthlyData}
      width={screenWidth - 40}
      height={220}
      chartConfig={{
        backgroundColor: "#e26a00",
        backgroundGradientFrom: "#fb8c00",
        backgroundGradientTo: "#ffa726",
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      }}
      
      style={{ marginVertical: 10 }}
      />
    </ScrollView>
  )
}