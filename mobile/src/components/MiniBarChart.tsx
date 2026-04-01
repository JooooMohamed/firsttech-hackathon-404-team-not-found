import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, SPACING, FONT_SIZE} from '../constants';

interface MiniBarChartProps {
  data: {label: string; earned: number; redeemed: number}[];
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({data}) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.earned, d.redeemed)), 1);

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((d, i) => (
          <View key={i} style={styles.barGroup}>
            <View style={styles.bars}>
              <View
                style={[
                  styles.bar,
                  styles.earnBar,
                  {height: Math.max((d.earned / maxVal) * 80, 2)},
                ]}
              />
              <View
                style={[
                  styles.bar,
                  styles.redeemBar,
                  {height: Math.max((d.redeemed / maxVal) * 80, 2)},
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, {backgroundColor: COLORS.secondary}]}
          />
          <Text style={styles.legendText}>Earned</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: COLORS.error}]} />
          <Text style={styles.legendText}>Redeemed</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: SPACING.xs,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 10,
    borderRadius: 3,
    minHeight: 2,
  },
  earnBar: {
    backgroundColor: COLORS.secondary,
  },
  redeemBar: {
    backgroundColor: COLORS.error,
  },
  barLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
