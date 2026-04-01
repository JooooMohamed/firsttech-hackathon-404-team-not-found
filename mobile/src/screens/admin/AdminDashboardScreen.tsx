import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {useAuthStore, useMerchantStore} from '../../stores';
import {RoleSwitcher, MiniBarChart, LineChart} from '../../components';
import {Merchant, MerchantStats, DailyStat} from '../../types';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import {transactionsApi} from '../../services/api';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ── Expandable Merchant Card ─────────────────────────── */
const MerchantAdminCard: React.FC<{
  merchant: Merchant;
  stats: MerchantStats | null;
  dailyStats: DailyStat[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSettings: () => void;
  onViewTransactions: (filter?: string) => void;
}> = ({
  merchant,
  stats,
  dailyStats,
  isExpanded,
  onToggle,
  onEdit,
  onSettings,
  onViewTransactions,
}) => {
  return (
    <TouchableOpacity
      style={[styles.merchantCard, isExpanded && styles.merchantCardExpanded]}
      onPress={onToggle}
      activeOpacity={0.7}>
      {/* Card Header (always visible) */}
      <View style={styles.merchantCardHeader}>
        <Text style={styles.merchantLogo}>{merchant.logo || '🏪'}</Text>
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <Text style={styles.merchantCategory}>{merchant.category}</Text>
        </View>
        <View style={styles.merchantMeta}>
          <Text style={styles.earnRateBadge}>{merchant.earnRate} EP/AED</Text>
          <Text style={styles.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {/* Expanded stats + actions */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={[
                styles.statCard,
                {borderBottomColor: COLORS.secondary, borderBottomWidth: 2},
              ]}
              onPress={() => onViewTransactions('earn')}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {stats?.totalPointsIssued?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Issued</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statCard,
                {borderBottomColor: COLORS.error, borderBottomWidth: 2},
              ]}
              onPress={() => onViewTransactions('redeem')}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {stats?.totalPointsRedeemed?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Redeemed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statCard,
                {borderBottomColor: COLORS.primary, borderBottomWidth: 2},
              ]}
              onPress={() => onViewTransactions('all')}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {stats?.totalTransactions || '0'}
              </Text>
              <Text style={styles.statLabel}>Txns</Text>
            </TouchableOpacity>
            <View
              style={[
                styles.statCard,
                {borderBottomColor: '#FF9800', borderBottomWidth: 2},
              ]}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {(
                  (stats?.totalPointsIssued || 0) -
                  (stats?.totalPointsRedeemed || 0)
                ).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Outstanding</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.statCard,
                {borderBottomColor: '#2196F3', borderBottomWidth: 2},
              ]}
              onPress={() => onViewTransactions('members')}>
              <Text
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {stats?.activeMembers || '0'}
              </Text>
              <Text style={styles.statLabel}>Members</Text>
            </TouchableOpacity>
          </View>

          {/* Status indicators */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: merchant.redemptionEnabled
                    ? COLORS.success + '15'
                    : COLORS.error + '15',
                },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: merchant.redemptionEnabled
                      ? COLORS.success
                      : COLORS.error,
                  },
                ]}>
                {merchant.redemptionEnabled ? '✓ Redeem ON' : '✗ Redeem OFF'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: merchant.crossSmeRedemption
                    ? COLORS.secondary + '15'
                    : COLORS.textSecondary + '10',
                },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: merchant.crossSmeRedemption
                      ? COLORS.secondary
                      : COLORS.textSecondary,
                  },
                ]}>
                {merchant.crossSmeRedemption
                  ? '🔗 Cross-SME ON'
                  : '🔒 Cross-SME OFF'}
              </Text>
            </View>
          </View>

          {/* 7-Day Activity Chart (N5) */}
          {dailyStats.length > 0 && (
            <View style={{marginBottom: SPACING.sm}}>
              <Text
                style={{
                  fontSize: FONT_SIZE.xs,
                  fontWeight: '700',
                  color: COLORS.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: SPACING.xs,
                }}>
                7-Day Activity
              </Text>
              <LineChart data={dailyStats} height={160} />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionChip} onPress={onEdit}>
              <Text style={styles.actionChipText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionChip} onPress={onSettings}>
              <Text style={styles.actionChipText}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => onViewTransactions()}>
              <Text style={styles.actionChipText}>📊 Transactions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

/* ── Admin Dashboard ──────────────────────────────── */
export const AdminDashboardScreen: React.FC<{navigation: any}> = ({
  navigation,
}) => {
  const {user, logout} = useAuthStore();
  const {merchants, fetchMerchants, getMerchantStats} = useMerchantStore();
  const [allStats, setAllStats] = useState<Record<string, MerchantStats>>({});
  const [allDailyStats, setAllDailyStats] = useState<
    Record<string, DailyStat[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await fetchMerchants();
      const currentMerchants = useMerchantStore.getState().merchants;
      const statsMap: Record<string, MerchantStats> = {};
      const dailyMap: Record<string, DailyStat[]> = {};
      await Promise.all(
        currentMerchants.map(async m => {
          try {
            statsMap[m._id] = await getMerchantStats(m._id);
          } catch {}
          try {
            dailyMap[m._id] = await transactionsApi.getDailyStats(m._id);
          } catch {}
        }),
      );
      setAllStats(statsMap);
      setAllDailyStats(dailyMap);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);
  };

  const toggleCard = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Aggregate stats across all merchants
  const totalIssued = Object.values(allStats).reduce(
    (s, st) => s + (st.totalPointsIssued || 0),
    0,
  );
  const totalRedeemed = Object.values(allStats).reduce(
    (s, st) => s + (st.totalPointsRedeemed || 0),
    0,
  );
  const totalTxns = Object.values(allStats).reduce(
    (s, st) => s + (st.totalTransactions || 0),
    0,
  );
  const totalMembers = Object.values(allStats).reduce(
    (s, st) => s + (st.activeMembers || 0),
    0,
  );
  const netOutstanding = totalIssued - totalRedeemed;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setShowRoleSwitcher(true)}>
          <Text style={styles.switchBtnText}>🔄 Switch Role</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAll} />
        }>
        <Text style={styles.badge}>⚙️ Admin Mode</Text>
        <Text style={styles.title}>Admin Dashboard</Text>

        {/* Global Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>All Merchants Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text
                style={styles.summaryValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}>
                {merchants.length}
              </Text>
              <Text style={styles.summaryLabel}>Merchants</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text
                style={styles.summaryValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}>
                {totalIssued.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Issued</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text
                style={styles.summaryValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}>
                {totalRedeemed.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Redeemed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text
                style={styles.summaryValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}>
                {netOutstanding.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Outstanding</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text
                style={styles.summaryValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}>
                {totalTxns}
              </Text>
              <Text style={styles.summaryLabel}>Txns</Text>
            </View>
          </View>
        </View>

        {/* Merchant List */}
        <Text style={styles.sectionTitle}>Merchants ({merchants.length})</Text>
        <Text style={styles.sectionSub}>Tap a merchant to expand details</Text>

        {merchants.map(m => (
          <MerchantAdminCard
            key={m._id}
            merchant={m}
            stats={allStats[m._id] || null}
            dailyStats={allDailyStats[m._id] || []}
            isExpanded={expandedId === m._id}
            onToggle={() => toggleCard(m._id)}
            onEdit={() =>
              navigation.navigate('MerchantSetup', {merchantId: m._id})
            }
            onSettings={() =>
              navigation.navigate('MerchantSettings', {merchantId: m._id})
            }
            onViewTransactions={(filter?: string) =>
              navigation.navigate('AdminTransactions', {
                merchantId: m._id,
                merchantName: m.name,
                filter: filter || 'all',
              })
            }
          />
        ))}

        {/* Add New Merchant */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('MerchantSetup', {})}>
          <Text style={styles.addBtnText}>+ Add New Merchant</Text>
        </TouchableOpacity>
      </ScrollView>

      <RoleSwitcher
        visible={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  switchBtn: {
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  switchBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  badge: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },

  /* Summary */
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Section */
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  /* Merchant Card */
  merchantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  merchantCardExpanded: {
    borderColor: COLORS.primary + '40',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  merchantCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantLogo: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  merchantCategory: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  merchantMeta: {
    alignItems: 'flex-end',
  },
  earnRateBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.secondary,
    backgroundColor: COLORS.secondary + '12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expandArrow: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  /* Expanded */
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#F0F0F0',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionChip: {
    flex: 1,
    backgroundColor: COLORS.primary + '10',
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionChipText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Add button */
  addBtn: {
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
