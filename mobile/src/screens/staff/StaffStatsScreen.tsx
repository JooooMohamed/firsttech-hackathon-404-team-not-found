import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useAuthStore,
  useMerchantStore,
  useTransactionStore,
} from '../../stores';
import {EmptyState, LineChart, TransactionItem} from '../../components';
import {Transaction, MerchantStats, DailyStat} from '../../types';
import {merchantsApi, transactionsApi} from '../../services/api';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const StaffStatsScreen: React.FC<{navigation: any}> = ({
  navigation: _navigation,
}) => {
  const {user} = useAuthStore();
  const {fetchMerchants} = useMerchantStore();
  const {fetchMerchantTransactions} = useTransactionStore();
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await fetchMerchants();
    if (user?.merchantId) {
      const txns = await fetchMerchantTransactions(user.merchantId);
      const sorted = [...txns].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentTxns(sorted.slice(0, 10));
      try {
        const s = await merchantsApi.getStats(user.merchantId);
        setStats(s);
        const d = await transactionsApi.getDailyStats(user.merchantId);
        setDailyStats(d);
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.merchantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Text style={styles.pageTitle}>Transaction Statistics</Text>

        {/* Stats Grid */}
        {stats ? (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stats.totalPointsIssued.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Issued EP</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: COLORS.error}]}>
                  {stats.totalPointsRedeemed.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Redeemed EP</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, {color: COLORS.primary}]}>
                  {(
                    stats.totalPointsIssued - stats.totalPointsRedeemed
                  ).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Outstanding</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalTransactions}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.activeMembers}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
            </View>

            {/* 7-Day Activity Chart */}
            {dailyStats.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>7-Day Activity</Text>
                <LineChart data={dailyStats} height={160} />
              </View>
            )}
          </>
        ) : (
          <EmptyState
            icon="📊"
            title="No Stats Yet"
            subtitle="Start issuing points to customers to see statistics here."
          />
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentTxns.length > 0 ? (
          recentTxns.map(tx => (
            <TransactionItem key={tx._id} transaction={tx} />
          ))
        ) : (
          <EmptyState
            icon="📋"
            title="No Transactions Yet"
            subtitle="Start issuing points to see activity here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    minWidth: '30%',
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
});
