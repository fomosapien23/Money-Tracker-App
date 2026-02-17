import { useTransactionStore } from "@/src/store/transactionStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";



export default function Stats() {

  const [filterType, setFilterType] = useState<"overall" | "monthly" | "yearly">("overall");
  const [chartType, setChartType] = useState<"expense" | "income">("expense");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const categoryTotals: { [key: string]: number } = {};
  const {transactions} = useTransactionStore();
  const screenWidth = Dimensions.get("window").width;
  
  

  const getCategoryColor = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360); // prevent negative
    return `hsl(${hue}, 70%, 60%)`;
  };



  const filteredByTime = transactions.filter((t) => {
    const txDate = new Date(t.date);

    if (filterType === "monthly") {
      return (
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }

    if (filterType === "yearly") {
      return txDate.getFullYear() === selectedDate.getFullYear();
    }

    return true;
  });

  const typeTransactions = filteredByTime.filter(
    (t) => t.type === chartType
  );
  console.log("Type Transactions:", typeTransactions);

  typeTransactions.forEach((tx) => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = 0;
    }
    categoryTotals[tx.category] += tx.amount;
  });
  
console.log("Category Totals:", categoryTotals);

  const categoryKeys = Object.keys(categoryTotals);


  const totalAmount = typeTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const pieData = categoryKeys.map((key, index) => ({
    value: categoryTotals[key],
    text:
      totalAmount === 0
        ? "0%"
        : `${Math.round(
            (categoryTotals[key] / totalAmount) * 100
          )}%`,
    label: key,
    color: getCategoryColor(key),
  }));

  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);

    if (filterType === "monthly") {
      return (
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getFullYear() === selectedDate.getFullYear()
      );
    }

    if (filterType === "yearly") {
      return txDate.getFullYear() === selectedDate.getFullYear();
    }

    return true; 
  });

  const expenseTransactions = filteredTransactions.filter(
    (t) => t.type === "expense"
  );

  

  
  
  const formatMonthYear = () => {
    return selectedDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  


  const now = new Date();

  const isFutureMonth =
    filterType === "monthly" &&
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth();

  const isFutureYear =
    filterType === "yearly" &&
    selectedDate.getFullYear() === now.getFullYear();

  
  const goToPrevious = () => {
    if (filterType === "monthly") {
      setSelectedDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
      );
    } else if (filterType === "yearly") {
      setSelectedDate(
        new Date(selectedDate.getFullYear() - 1, 0, 1)
      );
    }
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);

    if (filterType === "monthly") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (filterType === "yearly") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }

    // 🚫 Prevent future
    if (newDate > new Date()) return;

    setSelectedDate(newDate);
  };

  

  

  console.log("Pie Data:", pieData);
console.log("Total Amount:", totalAmount);
console.log("Chart Type:", chartType);
console.log("Transaction Types:", filteredByTime.map(t => t.type));


  return (
   <SafeAreaView style={{ flex: 1 }} edges={["top"]}>

    {/* Time FILTER BUTTONS */}
    <View
  style={{
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    marginTop: 20,
  }}
>
  {["overall", "monthly", "yearly"].map((filter) => {
    const isActive = filterType === filter;

    return (
      <TouchableOpacity
        key={filter}
        onPress={() => setFilterType(filter)}
        style={{
          paddingVertical: 12,
          alignItems: "center",
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: isActive ? "#1971C2" : "#868e96",
            textTransform: "capitalize",
          }}
        >
          {filter}
        </Text>

        {/* Active underline */}
        {isActive && (
          <View
            style={{
              height: 3,
              backgroundColor: "#1971C2",
              width: "60%",
              marginTop: 6,
              borderRadius: 2,
            }}
          />
        )}
      </TouchableOpacity>
    );
  })}
</View>



    {/* income/expense FILTER BUTTONS */}
   <View
  style={{
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  }}
>
  {["expense", "income"].map((type) => {
    const isActive = chartType === type;

    const activeColor ="#1971C2";

    return (
      <TouchableOpacity
        key={type}
        onPress={() => setChartType(type)}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 20,
          borderRadius: 10,
          marginHorizontal: 15,
          marginBottom: 10,
          borderWidth: 2,
          borderColor: activeColor,
          backgroundColor: isActive
            ? activeColor
            : "transparent",
            

        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: isActive ? "#fff" : activeColor,
            textTransform: "capitalize",
          }}
        >
          {type}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


    {filterType !== "overall" && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity onPress={goToPrevious}>
          <Ionicons
            name="chevron-back"
            size={24}
            color="#000"
          />
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          {filterType === "monthly"
            ? formatMonthYear()
            : selectedDate.getFullYear()}
        </Text>

        <TouchableOpacity disabled={isFutureMonth || isFutureYear} onPress={goToNext}
        style={{
          opacity: isFutureMonth || isFutureYear ? 0.3 : 1,
        }}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>
    )}

    <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>

      {/* PIE CHART FIRST */}
      {pieData.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No data to show
        </Text>
      ) : (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <PieChart
            data={pieData}
            donut
            showText
            focusOnPress
            radius={120}
            textSize={14}
            centerLabelComponent={() => (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  ₹ {totalAmount}
                </Text>
                <Text>{chartType.toUpperCase()}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* CATEGORY LIST BELOW */}
      <View style={{ marginTop: 30 }}>
        {Object.keys(categoryTotals).length === 0 ? null : (
          Object.keys(categoryTotals)
            .sort(
              (a, b) => categoryTotals[b] - categoryTotals[a]
            )
            .map((key, index) => {
              const percentage =
                totalAmount === 0
                  ? 0
                  : Math.round(
                      (categoryTotals[key] / totalAmount) * 100
                    );

              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderBottomWidth: 0.5,
                    borderColor: "#ddd",
                  }}
                >
                  {/* Left Side */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: getCategoryColor(key),
                        marginRight: 10,
                      }}
                    />

                    <Text style={{ fontWeight: "500" }}>
                      {key}
                    </Text>
                  </View>

                  {/* Right Side */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontWeight: "600" }}>
                      ₹ {categoryTotals[key]}
                    </Text>
                    <Text style={{ fontSize: 12, color: "gray" }}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
              );
            })
        )}
      </View>

    </ScrollView>


   </SafeAreaView>
);

}