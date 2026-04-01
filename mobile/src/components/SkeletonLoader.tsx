import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, ViewStyle} from 'react-native';
import {COLORS} from '../constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: COLORS.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{style?: ViewStyle}> = ({style}) => (
  <View style={[skStyles.card, style]}>
    <View style={skStyles.row}>
      <Skeleton width={42} height={42} borderRadius={10} />
      <View style={skStyles.content}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} style={skStyles.mt6} />
      </View>
    </View>
  </View>
);

export const SkeletonBalanceCard: React.FC = () => (
  <View style={skStyles.balanceCard}>
    <Skeleton width={100} height={12} borderRadius={4} />
    <Skeleton width={140} height={36} borderRadius={8} style={skStyles.mt8} />
    <Skeleton width={60} height={12} borderRadius={4} style={skStyles.mt6} />
  </View>
);

const skStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  balanceCard: {
    backgroundColor: COLORS.primary + '30',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  mt6: {
    marginTop: 6,
  },
  mt8: {
    marginTop: 8,
  },
});
