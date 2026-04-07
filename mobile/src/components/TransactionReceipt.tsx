import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {COLORS, SPACING, FONT_SIZE} from '../constants';

interface ReceiptProps {
  type: 'earn' | 'redeem';
  points: number;
  amountAed?: number;
  earnRate?: number;
  bonusPoints?: number;
  appliedOffers?: string[];
  memberName: string;
  merchantName: string;
  newBalance?: number;
  onDone: () => void;
}

export const TransactionReceipt: React.FC<ReceiptProps> = ({
  type,
  points,
  amountAed,
  earnRate,
  bonusPoints = 0,
  appliedOffers = [],
  memberName,
  merchantName,
  newBalance,
  onDone,
}) => {
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence: checkmark bounces in → rotates → receipt fades up → pulse loop
    Animated.sequence([
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(checkRotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Gentle pulse on the checkmark
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spin = checkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isEarn = type === 'earn';
  const accentColor = isEarn ? COLORS.success : COLORS.primary;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Checkmark */}
      <Animated.View
        style={[
          styles.checkCircle,
          {
            backgroundColor: accentColor,
            transform: [
              {scale: Animated.multiply(checkScale, pulseAnim)},
              {rotate: spin},
            ],
          },
        ]}>
        <Text style={styles.checkIcon}>{isEarn ? '✅' : '🎉'}</Text>
      </Animated.View>

      <Animated.Text
        style={[styles.title, {opacity: checkScale, color: accentColor}]}>
        {isEarn ? 'Points Issued!' : 'Redemption Complete!'}
      </Animated.Text>

      <Animated.Text style={[styles.pointsHero, {opacity: checkScale}]}>
        {isEarn ? '+' : '-'}
        {points} EP
      </Animated.Text>

      {/* Receipt card */}
      <Animated.View
        style={[
          styles.receiptCard,
          {
            opacity: fadeIn,
            transform: [{translateY: slideUp}],
          },
        ]}>
        {/* Dotted top border */}
        <View style={styles.dottedBorder} />

        <Text style={styles.receiptTitle}>Transaction Receipt</Text>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Type</Text>
          <Text
            style={[
              styles.receiptValue,
              {color: accentColor, fontWeight: '800'},
            ]}>
            {isEarn ? 'Earn' : 'Redeem'}
          </Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Member</Text>
          <Text style={styles.receiptValue}>{memberName}</Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Merchant</Text>
          <Text style={styles.receiptValue}>{merchantName}</Text>
        </View>

        {isEarn && amountAed != null && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Bill Amount</Text>
            <Text style={styles.receiptValue}>AED {amountAed}</Text>
          </View>
        )}

        {isEarn && earnRate != null && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Earn Rate</Text>
            <Text style={styles.receiptValue}>{earnRate} EP/AED</Text>
          </View>
        )}

        {bonusPoints > 0 && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Bonus</Text>
            <Text
              style={[
                styles.receiptValue,
                {color: COLORS.secondary, fontWeight: '700'},
              ]}>
              +{bonusPoints} EP
              {appliedOffers.length > 0 ? ` (${appliedOffers.join(', ')})` : ''}
            </Text>
          </View>
        )}

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Points</Text>
          <Text
            style={[
              styles.receiptValue,
              {fontWeight: '900', fontSize: FONT_SIZE.lg},
            ]}>
            {isEarn ? '+' : '-'}
            {points} EP
          </Text>
        </View>

        {newBalance != null && (
          <View style={[styles.receiptRow, styles.receiptRowHighlight]}>
            <Text style={styles.receiptLabel}>New Balance</Text>
            <Text
              style={[
                styles.receiptValue,
                {fontWeight: '900', color: COLORS.primary},
              ]}>
              {newBalance.toLocaleString()} EP
            </Text>
          </View>
        )}

        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Date</Text>
          <Text style={styles.receiptValue}>
            {dateStr} at {timeStr}
          </Text>
        </View>

        {/* Dotted bottom border */}
        <View style={styles.dottedBorder} />
      </Animated.View>

      {/* Done button */}
      <Animated.View style={{opacity: fadeIn, width: '100%'}}>
        <TouchableOpacity
          style={[styles.doneBtn, {backgroundColor: accentColor}]}
          activeOpacity={0.8}
          onPress={onDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    marginBottom: SPACING.xs,
  },
  pointsHero: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dottedBorder: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  receiptTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  receiptRowHighlight: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: -SPACING.sm,
  },
  receiptLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  receiptValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  doneBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
});
