import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../constants";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  style?: ViewStyle;
}

export const BalanceCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon,
  color = COLORS.primary,
  style,
}) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }, style]}>
      <View style={styles.row}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, { color }]}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  value: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    marginTop: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
