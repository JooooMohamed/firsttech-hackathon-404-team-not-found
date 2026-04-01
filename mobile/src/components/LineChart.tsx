import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {COLORS, SPACING, FONT_SIZE} from '../constants';

interface LineChartProps {
  data: {label?: string; date?: string; earned: number; redeemed: number}[];
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({data, height = 160}) => {
  if (data.length < 2) return null;

  const PADDING_LEFT = 40;
  const PADDING_RIGHT = 16;
  const PADDING_TOP = 16;
  const PADDING_BOTTOM = 28;
  const chartWidth = 320;
  const chartHeight = height;

  const allVals = data.flatMap(d => [d.earned, d.redeemed]);
  const maxVal = Math.max(...allVals, 1);
  const minVal = 0;

  const plotW = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const plotH = chartHeight - PADDING_TOP - PADDING_BOTTOM;

  const getX = (i: number) => PADDING_LEFT + (i / (data.length - 1)) * plotW;
  const getY = (val: number) =>
    PADDING_TOP + plotH - ((val - minVal) / (maxVal - minVal)) * plotH;

  // Build SVG paths
  const buildPath = (key: 'earned' | 'redeemed') => {
    return data
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  };

  // Build area fill path (closed at bottom)
  const buildAreaPath = (key: 'earned' | 'redeemed') => {
    const linePath = buildPath(key);
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = PADDING_TOP + plotH;
    return `${linePath} L${lastX},${bottomY} L${firstX},${bottomY} Z`;
  };

  const earnPath = buildPath('earned');
  const redeemPath = buildPath('redeemed');
  const earnAreaPath = buildAreaPath('earned');
  const redeemAreaPath = buildAreaPath('redeemed');

  // Y-axis labels (3 ticks)
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  // Format numbers compactly
  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <Defs>
          <LinearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.secondary} stopOpacity="0.25" />
            <Stop offset="1" stopColor={COLORS.secondary} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="redeemGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.error} stopOpacity="0.15" />
            <Stop offset="1" stopColor={COLORS.error} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <React.Fragment key={i}>
            <Line
              x1={PADDING_LEFT}
              y1={getY(tick)}
              x2={chartWidth - PADDING_RIGHT}
              y2={getY(tick)}
              stroke={COLORS.border || '#E5E5E5'}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={PADDING_LEFT - 6}
              y={getY(tick) + 4}
              fill={COLORS.textSecondary}
              fontSize={10}
              fontWeight="600"
              textAnchor="end">
              {formatNum(tick)}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Area fills */}
        <Path d={earnAreaPath} fill="url(#earnGrad)" />
        <Path d={redeemAreaPath} fill="url(#redeemGrad)" />

        {/* Lines */}
        <Path
          d={earnPath}
          stroke={COLORS.secondary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={redeemPath}
          stroke={COLORS.error}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <Circle
              cx={getX(i)}
              cy={getY(d.earned)}
              r={3}
              fill={COLORS.secondary}
            />
            <Circle
              cx={getX(i)}
              cy={getY(d.redeemed)}
              r={3}
              fill={COLORS.error}
            />
          </React.Fragment>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const labelText = d.label || (d.date ? d.date.slice(5) : '');
          return (
            <SvgText
              key={`label-${i}`}
              x={getX(i)}
              y={chartHeight - 4}
              fill={COLORS.textSecondary}
              fontSize={9}
              fontWeight="600"
              textAnchor="middle">
              {labelText}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendLine, {backgroundColor: COLORS.secondary}]}
          />
          <Text style={styles.legendText}>Earned</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, {backgroundColor: COLORS.error}]} />
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#E5E5E5',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
