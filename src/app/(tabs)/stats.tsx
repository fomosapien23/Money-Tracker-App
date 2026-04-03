import type { AppColors } from "@/src/context/ThemeContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  filterTransactionsByTime,
  getDateRangeForFilter,
} from "@/src/features/ai/mapper";
import type { AiMode, TimeFilter } from "@/src/features/ai/types";
import { useAiInsights } from "@/src/features/ai/useAiInsights";
import { fetchTransactions } from "@/src/services/transactionService";
import type { Transaction } from "@/src/type/transaction";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Stats() {
  const { colors, resolved } = useTheme();
  const styles = useMemo(() => createStatsStyles(colors), [colors]);

  const tabBarHeight = useBottomTabBarHeight();
  const { bottom: safeBottom } = useSafeAreaInsets();
  const scrollBottomPad = Math.max(tabBarHeight, 60 + safeBottom) + 16;

  const [filterType, setFilterType] = useState<TimeFilter>("overall");
  const [chartType, setChartType] = useState<"expense" | "income">("expense");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const categoryTotals: { [key: string]: number } = {};
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiMode, setAiMode] = useState<AiMode>("spending-summary");
  const { aiLoading, aiError, aiResult, askAi } = useAiInsights();

  const getCategoryColor = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360); // prevent negative
    const lightness = resolved === "dark" ? "58%" : "60%";
    return `hsl(${hue}, 65%, ${lightness})`;
  };

  const filteredByTime = useMemo(
    () =>
      filterTransactionsByTime({
        transactions,
        filterType,
        selectedDate,
      }),
    [transactions, filterType, selectedDate],
  );

  const typeTransactions = filteredByTime.filter((t) => t.type === chartType);

  typeTransactions.forEach((tx) => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = 0;
    }
    categoryTotals[tx.category] += tx.amount;
  });

  const categoryKeys = Object.keys(categoryTotals);

  const totalAmount = typeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const pieData = categoryKeys.map((key) => ({
    value: categoryTotals[key],
    text:
      totalAmount === 0
        ? "0%"
        : `${Math.round((categoryTotals[key] / totalAmount) * 100)}%`,
    label: key,
    color: getCategoryColor(key),
  }));

  const currentPeriod = useMemo(
    () => getDateRangeForFilter(filterType, selectedDate),
    [filterType, selectedDate],
  );

  const handleAskAi = async () => {
    await askAi({
      mode: aiMode,
      transactions: filteredByTime,
      period: currentPeriod,
      currency: "INR",
    });
  };

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
    filterType === "yearly" && selectedDate.getFullYear() === now.getFullYear();

  const goToPrevious = () => {
    if (filterType === "monthly") {
      setSelectedDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1),
      );
    } else if (filterType === "yearly") {
      setSelectedDate(new Date(selectedDate.getFullYear() - 1, 0, 1));
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

  useFocusEffect(
    React.useCallback(() => {
      const fetchTransactionsData = async () => {
        const transactionsData = await fetchTransactions();
        setTransactions(transactionsData);
      };
      fetchTransactionsData();
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* Time FILTER BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          marginTop: 20,
        }}
      >
        {["overall", "monthly", "yearly"].map((filter) => {
          const isActive = filterType === filter;

          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setFilterType(filter as any)}
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
                  color: isActive ? colors.primary : colors.textMuted,
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
                    backgroundColor: colors.primary,
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

          const activeColor = colors.primary;

          return (
            <TouchableOpacity
              key={type}
              onPress={() => setChartType(type as any)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 10,
                marginHorizontal: 15,
                marginBottom: 10,
                borderWidth: 2,
                borderColor: activeColor,
                backgroundColor: isActive ? activeColor : "transparent",
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
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text
            style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
          >
            {filterType === "monthly"
              ? formatMonthYear()
              : selectedDate.getFullYear()}
          </Text>

          <TouchableOpacity
            disabled={isFutureMonth || isFutureYear}
            onPress={goToNext}
            style={{
              opacity: isFutureMonth || isFutureYear ? 0.3 : 1,
            }}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
            </View>
            <View style={styles.aiHeaderText}>
              <Text style={styles.aiCardTitle}>AI insights</Text>
              <Text style={styles.aiCardSubtitle}>
                Choose a focus, then generate tips for the filters above
              </Text>
            </View>
          </View>

          <Text style={styles.aiFieldLabel}>Focus</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiChipsRow}
          >
            {[
              { key: "spending-summary", label: "Summary" },
              { key: "budget-coach", label: "Budget coach" },
              { key: "saving-advice", label: "Saving advice" },
            ].map((mode) => {
              const isActive = aiMode === mode.key;
              return (
                <TouchableOpacity
                  key={mode.key}
                  onPress={() => setAiMode(mode.key as AiMode)}
                  style={[
                    styles.aiChip,
                    isActive && styles.aiChipActive,
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.aiChipText,
                      isActive && styles.aiChipTextActive,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={handleAskAi}
            disabled={aiLoading}
            style={[
              styles.aiCta,
              aiLoading && styles.aiCtaDisabled,
            ]}
            activeOpacity={0.9}
          >
            <Ionicons
              name="sparkles-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.aiCtaText}>
              {aiLoading ? "Analyzing…" : "Generate insights"}
            </Text>
          </TouchableOpacity>

          {aiError ? (
            <View style={styles.aiErrorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.aiErrorText}>{aiError}</Text>
            </View>
          ) : null}

          {aiResult ? (
            <View style={styles.aiResultSection}>
              <Text style={styles.aiResultHeading}>Response</Text>
              <View style={styles.aiResultPanel}>
                <Text style={styles.aiResultSummary}>{aiResult.summaryText}</Text>
                {aiResult.bulletPoints?.length > 0 ? (
                  <View style={styles.aiBullets}>
                    {aiResult.bulletPoints.map((point, idx) => (
                      <View key={idx} style={styles.aiBulletRow}>
                        <Ionicons
                          name="ellipse"
                          size={6}
                          color={colors.primary}
                          style={styles.aiBulletDot}
                        />
                        <Text style={styles.aiBulletText}>{point}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionRule} />

        {/* PIE CHART */}
        {pieData.length === 0 ? (
          <Text style={styles.chartEmpty}>No data to show</Text>
        ) : (
          <View style={styles.chartWrap}>
            <PieChart
              data={pieData}
              donut
              showText
              focusOnPress
              radius={120}
              textSize={14}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 18,
                      color: colors.text,
                    }}
                  >
                    ₹ {totalAmount}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {chartType.toUpperCase()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.sectionRule} />

        {/* CATEGORY LIST */}
        <View style={styles.categorySection}>
          {Object.keys(categoryTotals).length === 0
            ? null
            : Object.keys(categoryTotals)
                .sort((a, b) => categoryTotals[b] - categoryTotals[a])
                .map((key, index) => {
                  const percentage =
                    totalAmount === 0
                      ? 0
                      : Math.round((categoryTotals[key] / totalAmount) * 100);

                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderColor: colors.border,
                      }}
                    >
                      {/* Left Side */}
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: getCategoryColor(key),
                            marginRight: 10,
                          }}
                        />

                        <Text
                          style={{ fontWeight: "500", color: colors.text }}
                        >
                          {key}
                        </Text>
                      </View>

                      {/* Right Side */}
                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={{ fontWeight: "600", color: colors.text }}
                        >
                          ₹ {categoryTotals[key]}
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: colors.textMuted }}
                        >
                          {percentage}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStatsStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingTop: 8,
    },
    aiCard: {
      marginHorizontal: 16,
      marginBottom: 4,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    aiCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    aiIconBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    aiHeaderText: {
      flex: 1,
    },
    aiCardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    aiCardSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    aiFieldLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    aiChipsRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 4,
      gap: 8,
    },
    aiChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceMuted,
    },
    aiChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    aiChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    aiChipTextActive: {
      color: "#fff",
    },
    aiCta: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    aiCtaDisabled: {
      backgroundColor: colors.textMuted,
    },
    aiCtaText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },
    aiErrorBox: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.errorSurface,
      borderWidth: 1,
      borderColor: colors.errorBorder,
    },
    aiErrorText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: colors.danger,
    },
    aiResultSection: {
      marginTop: 16,
    },
    aiResultHeading: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 8,
    },
    aiResultPanel: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    aiResultSummary: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.text,
    },
    aiBullets: {
      marginTop: 10,
      gap: 8,
    },
    aiBulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    aiBulletDot: {
      marginTop: 6,
      marginRight: 10,
    },
    aiBulletText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
    },
    sectionRule: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginHorizontal: 20,
      marginVertical: 20,
    },
    chartEmpty: {
      textAlign: "center",
      marginTop: 8,
      color: colors.textMuted,
      fontSize: 15,
    },
    chartWrap: {
      alignItems: "center",
      paddingHorizontal: 16,
    },
    categorySection: {
      marginTop: 8,
      marginBottom: 0,
    },
  });
}
