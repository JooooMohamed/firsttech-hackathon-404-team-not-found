import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Transaction, Merchant} from '../types';
import {COLORS, SPACING, FONT_SIZE} from '../constants';

interface Props {
  transaction: Transaction;
}

export const TransactionItem: React.FC<Props> = ({transaction}) => {
  const isEarn = transaction.type === 'earn';
  const merchantObj =
    typeof transaction.merchantId === 'object'
      ? (transaction.merchantId as Merchant)
      : null;
  const merchantName = merchantObj?.name || 'Merchant';
  const merchantLogo = merchantObj?.logo || '🏪';

  const date = new Date(transaction.createdAt).toLocaleDateString('en-AE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.item}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isEarn ? COLORS.earn + '15' : COLORS.redeem + '15',
          },
        ]}>
        <Text style={styles.badgeEmoji}>{merchantLogo}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant}>
          {isEarn ? '↑ ' : '↓ '}
          {merchantName}
        </Text>
        <Text style={styles.date}>{date}</Text>
        {isEarn && transaction.amountAed && (
          <Text style={styles.detail}>Bill: {transaction.amountAed} AED</Text>
        )}
      </View>
      <Text
        style={[styles.points, {color: isEarn ? COLORS.earn : COLORS.redeem}]}>
        {isEarn ? '+' : '-'}
        {transaction.points} EP
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  merchant: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  points: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
});
