import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Vibration,
  Alert,
  Share,
} from 'react-native';
import {useTransactionStore} from '../../stores';
import {TransactionItem, EmptyState, SkeletonCard} from '../../components';
import {transactionsApi} from '../../services/api';
import {Transaction} from '../../types';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import {useNavigation} from '@react-navigation/native';

type FilterType = 'all' | 'earn' | 'redeem';
type DateRange = 'all' | '7d' | '30d' | '90d';

const getDateRange = (
  range: DateRange,
): {startDate?: string; endDate?: string} => {
  if (range === 'all') return {};
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {startDate: start.toISOString().split('T')[0]};
};

export const TransactionHistoryScreen: React.FC<{navigation?: any}> = ({
  navigation,
}) => {
  const nav = useNavigation<any>();
  const {transactions, isLoading, fetchMyTransactions} = useTransactionStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const csvData = await transactionsApi.exportMyCsv();
      await Share.share({
        message: csvData,
        title: 'EasyPoints Transactions Export',
      });
      Vibration.vibrate(10);
    } catch (e: any) {
      Alert.alert(
        'Export Failed',
        e?.response?.data?.message || 'Could not export transactions',
      );
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchMyTransactions(getDateRange(dateRange));
  }, [dateRange]);

  const filtered =
    filter === 'all'
      ? transactions
      : transactions.filter((t: Transaction) => t.type === filter);

  const FILTERS: {key: FilterType; label: string}[] = [
    {key: 'all', label: 'All'},
    {key: 'earn', label: 'Earned'},
    {key: 'redeem', label: 'Redeemed'},
  ];

  const DATE_RANGES: {key: DateRange; label: string}[] = [
    {key: 'all', label: 'All Time'},
    {key: '7d', label: 'Last 7 Days'},
    {key: '30d', label: 'Last 30 Days'},
    {key: '90d', label: 'Last 90 Days'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.subHeaderRow}>
          <Text style={styles.count}>{filtered.length} transactions</Text>
          {filtered.length > 0 && (
            <TouchableOpacity
              onPress={handleExportCsv}
              disabled={exporting}
              style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>
                {exporting ? '⏳...' : '📊 Export CSV'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* N3: Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterActive]}
            onPress={() => {
              Vibration.vibrate(10);
              setFilter(f.key);
            }}>
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date range pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{flexGrow: 0}}
        contentContainerStyle={styles.filterRow}>
        {DATE_RANGES.map(d => (
          <TouchableOpacity
            key={d.key}
            style={[
              styles.datePill,
              dateRange === d.key && styles.datePillActive,
            ]}
            onPress={() => {
              Vibration.vibrate(10);
              setDateRange(d.key);
            }}>
            <Text
              style={[
                styles.dateText,
                dateRange === d.key && styles.dateTextActive,
              ]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchMyTransactions(getDateRange(dateRange))}
          />
        }
        renderItem={({item}) => <TransactionItem transaction={item} />}
        ListEmptyComponent={
          isLoading ? (
            <View>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <EmptyState
              icon={
                filter === 'earn'
                  ? '\u{1F4B0}'
                  : filter === 'redeem'
                  ? '\u{1F381}'
                  : '\u{1F4CB}'
              }
              title={
                filter === 'all'
                  ? 'No transactions yet'
                  : `No ${filter} transactions`
              }
              subtitle="Visit a merchant to earn your first EasyPoints!"
              actionLabel="Browse Merchants"
              onAction={() => navigation?.navigate?.('MerchantDirectory')}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  header: {padding: SPACING.lg, paddingBottom: SPACING.xs},
  title: {fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text},
  count: {fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2},
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  exportBtn: {
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  exportBtnText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {color: '#FFF'},
  datePill: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateTextActive: {color: '#FFF'},
  list: {padding: SPACING.lg, paddingTop: 0},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
  },
  backArrow: {
    fontSize: 22,
  },
});
