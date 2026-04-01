import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Merchant } from "../types";
import { COLORS, SPACING, FONT_SIZE } from "../constants";

interface Props {
  merchant: Merchant;
  onPress: () => void;
}

export const MerchantCard: React.FC<Props> = ({ merchant, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.logo}>{merchant.logo || "🏪"}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{merchant.name}</Text>
        <Text style={styles.category}>{merchant.category}</Text>
        <Text style={styles.earn}>Earn {merchant.earnRate} EP per 1 AED</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  earn: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: "600",
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
});
