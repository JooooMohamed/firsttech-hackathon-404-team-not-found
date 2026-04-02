import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Vibration,
  Animated,
  Share,
  FlatList,
} from 'react-native';
import Svg, {Circle, G} from 'react-native-svg';
import {
  useAuthStore,
  useWalletStore,
  useMerchantStore,
  useNotificationStore,
} from '../../stores';
import {
  BalanceCard,
  RoleSwitcher,
  AnimatedCounter,
  SkeletonBalanceCard,
  SkeletonCard,
} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';
import {transactionsApi} from '../../services/api';
import {Merchant, Transaction} from '../../types';

// ─── Donut chart (wallet breakdown) ──────────────────
const DonutChart: React.FC<{
  slices: {label: string; value: number; color: string}[];
  size?: number;
}> = ({slices, size = 120}) => {
  const total = slices.reduce((acc, sl) => acc + sl.value, 0);
  if (total === 0) {
    return null;
  }
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <View style={donutStyles.wrap}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {slices.map((sl, i) => {
            const percent = sl.value / total;
            const strokeDasharray = `${circumference * percent} ${
              circumference * (1 - percent)
            }`;
            const strokeDashoffset = -circumference * cumulativePercent;
            cumulativePercent += percent;
            return (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={sl.color}
                strokeWidth={14}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>
      <View style={donutStyles.legend}>
        {slices
          .filter(item => item.value > 0)
          .map((sl, i) => (
            <View key={i} style={donutStyles.legendRow}>
              <View style={[donutStyles.dot, {backgroundColor: sl.color}]} />
              <Text style={donutStyles.legendText} numberOfLines={1}>
                {sl.label}
              </Text>
              <Text style={donutStyles.legendPct}>
                {Math.round((sl.value / total) * 100)}%
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
};

// ─── Main HomeScreen ──────────────────────────────────
export const HomeScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, activeRole} = useAuthStore();
  const {easyPointsBalance, linkedPrograms, isLoading, refreshAll, epAedRate} =
    useWalletStore();
  const {merchants, fetchMerchants} = useMerchantStore();
  const {unreadCount} = useNotificationStore();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<{
    earned: number;
    redeemed: number;
    txCount: number;
    topMerchant: {name: string; logo: string; points: number} | null;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadAll = useCallback(async () => {
    await Promise.all([refreshAll(), fetchMerchants()]);
    try {
      const [txns, ins] = await Promise.all([
        transactionsApi.getMyTransactions(),
        transactionsApi.getMyInsights(),
      ]);
      setRecentTxns(txns.slice(0, 3));
      setInsights(ins);
    } catch (_) {}
    setLastSynced(new Date());
    setHasLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    Vibration.vibrate(10);
    await loadAll();
  }, [loadAll]);

  const ROLE_LABELS: Record<string, {label: string; icon: string}> = {
    member: {label: 'Member', icon: '\u{1F464}'},
    staff: {label: 'Staff', icon: '\u{1F3F7}\uFE0F'},
    admin: {label: 'Admin', icon: '\u2699\uFE0F'},
  };
  const currentRole = ROLE_LABELS[activeRole] || ROLE_LABELS.member;

  // AED estimated total (all from DB)
  const epAed = easyPointsBalance * epAedRate;
  const programAed = linkedPrograms.reduce(
    (sum, p) => sum + p.balance * (p.aedRate || 0.01),
    0,
  );
  const totalAed = epAed + programAed;

  // Donut slices
  const donutSlices = [
    {label: 'EasyPoints', value: epAed, color: COLORS.primary},
    ...linkedPrograms.map(p => ({
      label: p.programName,
      value: p.balance * (p.aedRate || 0.01),
      color: p.brandColor || COLORS.textSecondary,
    })),
  ];

  // Last synced label
  const syncMinutes = Math.max(
    0,
    Math.floor((Date.now() - lastSynced.getTime()) / 60000),
  );
  const syncLabel = syncMinutes < 1 ? 'Just now' : `${syncMinutes}m ago`;

  // Featured merchants (first 6)
  const featured = merchants.slice(0, 6);

  const handleShare = async () => {
    const code = user?.referralCode || '';
    try {
      await Share.share({
        message: `Join me on EasyPoints \u2014 the unified loyalty wallet for UAE! Use my referral code ${code} when you sign up and we both benefit. Download now: https://easypoints.ae`,
      });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={st.container}>
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={st.header}>
          <View style={st.headerLeft}>
            <Text style={st.greeting}>
              Hello, {user?.name?.split(' ')[0]} {'\u{1F44B}'}
            </Text>
            <Text style={st.subtitle}>Your loyalty, unified</Text>
          </View>
          <TouchableOpacity
            style={st.notifBtn}
            onPress={() => {
              Vibration.vibrate(10);
              navigation.navigate('Notifications');
            }}>
            <Text style={st.bellIcon}>{'\u{1F514}'}</Text>
            {unreadCount > 0 && (
              <View style={st.notifBadge}>
                <Text style={st.notifBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Role switcher */}
        {(user?.roles?.length || 0) > 1 && (
          <TouchableOpacity
            style={st.roleSwitcherBar}
            onPress={() => {
              Vibration.vibrate(10);
              setShowRoleSwitcher(true);
            }}
            activeOpacity={0.7}>
            <Text style={st.roleIcon}>{currentRole.icon}</Text>
            <Text style={st.roleLabel}>{currentRole.label} Mode</Text>
            <Text style={st.roleSwitchText}>Switch {'\u203A'}</Text>
          </TouchableOpacity>
        )}

        {!hasLoaded && isLoading ? (
          <>
            <SkeletonBalanceCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <Animated.View style={{opacity: fadeAnim}}>
            {/* Estimated Total Value */}
            {linkedPrograms.length > 0 && (
              <View style={st.grandTotalCard}>
                <Text style={st.grandTotalLabel}>Estimated Total Value</Text>
                <View style={st.grandTotalRow}>
                  <Text style={st.grandTotalCurrency}>AED</Text>
                  <AnimatedCounter
                    value={Math.round(totalAed)}
                    style={st.grandTotalBalance}
                    duration={1000}
                  />
                </View>
                <Text style={st.grandTotalSub}>
                  across {linkedPrograms.length + 1} programs
                </Text>
                <View style={st.syncRow}>
                  <Text style={st.syncDot}>{'\u25CF'}</Text>
                  <Text style={st.syncText}>Synced {syncLabel}</Text>
                </View>
              </View>
            )}

            {/* EasyPoints Hero */}
            <View style={st.heroCard}>
              <Text style={st.heroLabel}>EasyPoints Balance</Text>
              <AnimatedCounter
                value={easyPointsBalance}
                style={st.heroBalance}
                duration={800}
              />
              <Text style={st.heroCurrency}>EP</Text>
              <View style={st.heroSubRow}>
                <View style={st.expiryBadge}>
                  <Text style={st.expiryText}>
                    {'\u23F3'} Points expire after 90 days of inactivity
                  </Text>
                </View>
                <Text style={st.heroAed}>
                  {'\u2248'} AED {epAed.toFixed(0)}
                </Text>
              </View>
            </View>

            {/* My QR Code — single unified CTA */}
            <TouchableOpacity
              style={st.qrCta}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EarnQR', {})}>
              <Text style={st.qrCtaIcon}>{'\uD83D\uDCF1'}</Text>
              <View style={st.qrCtaContent}>
                <Text style={st.qrCtaLabel}>Show My QR Code</Text>
                <Text style={st.qrCtaSub}>
                  For earning or redeeming points at any merchant
                </Text>
              </View>
              <Text style={st.qrCtaArrow}>{'\u203A'}</Text>
            </TouchableOpacity>

            {/* Wallet Breakdown */}
            {linkedPrograms.length > 0 && (
              <>
                <Text style={st.sectionTitle}>Wallet Breakdown</Text>
                <View style={st.donutContainer}>
                  <DonutChart slices={donutSlices} size={110} />
                </View>
              </>
            )}

            {/* Linked Programs */}
            {linkedPrograms.length > 0 && (
              <>
                <View style={st.sectionHeader}>
                  <Text style={st.sectionTitle}>Linked Programs</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('LinkProgram')}>
                    <Text style={st.sectionLink}>Manage {'\u203A'}</Text>
                  </TouchableOpacity>
                </View>
                {linkedPrograms.map(program => (
                  <TouchableOpacity
                    key={program._id}
                    activeOpacity={0.7}
                    onPress={() => Vibration.vibrate(10)}>
                    <BalanceCard
                      title={program.programName}
                      value={program.balance}
                      subtitle={`${
                        program.tier ? program.tier + ' \u2022 ' : ''
                      }${program.currency} \u2022 \u2248 AED ${(
                        program.balance * (program.aedRate || 0.01)
                      ).toFixed(0)}`}
                      icon={program.programLogo}
                      color={program.brandColor || COLORS.primary}
                    />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Member Insights */}
            {insights && insights.txCount > 0 && (
              <>
                <Text style={st.sectionTitle}>Your Month</Text>
                <View style={st.insightsCard}>
                  <View style={st.insightsRow}>
                    <View style={st.insightItem}>
                      <Text style={st.insightValue}>
                        +{insights.earned.toLocaleString()}
                      </Text>
                      <Text style={st.insightLabel}>EP Earned</Text>
                    </View>
                    <View style={st.insightDivider} />
                    <View style={st.insightItem}>
                      <Text style={[st.insightValue, {color: COLORS.redeem}]}>
                        -{insights.redeemed.toLocaleString()}
                      </Text>
                      <Text style={st.insightLabel}>EP Redeemed</Text>
                    </View>
                    <View style={st.insightDivider} />
                    <View style={st.insightItem}>
                      <Text style={st.insightValue}>{insights.txCount}</Text>
                      <Text style={st.insightLabel}>Transactions</Text>
                    </View>
                  </View>
                  {insights.topMerchant && (
                    <View style={st.topMerchant}>
                      <Text style={st.topMerchantLabel}>
                        {'\u2B50'} Top merchant:
                      </Text>
                      <Text style={st.topMerchantName}>
                        {insights.topMerchant.logo} {insights.topMerchant.name}{' '}
                        ({insights.topMerchant.points} EP)
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Featured Merchants */}
            {featured.length > 0 && (
              <>
                <View style={st.sectionHeader}>
                  <Text style={st.sectionTitle}>Earn Points Nearby</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.getParent()?.navigate('MerchantsTab')
                    }>
                    <Text style={st.sectionLink}>See All {'\u203A'}</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={featured}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={m => m._id}
                  contentContainerStyle={st.featuredList}
                  renderItem={({item}: {item: Merchant}) => (
                    <TouchableOpacity
                      style={st.featuredCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        useMerchantStore.getState().selectMerchant(item);
                        navigation.getParent()?.navigate('MerchantsTab', {
                          screen: 'MerchantProfile',
                          params: {merchantId: item._id},
                        });
                      }}>
                      <Text style={st.featuredLogo}>
                        {item.logo || '\u{1F3EA}'}
                      </Text>
                      <Text style={st.featuredName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={st.featuredRate}>
                        {item.earnRate} EP/AED
                      </Text>
                      {item.crossSmeRedemption && (
                        <Text style={st.crossBadge}>
                          {'\u{1F517}'} Cross-Brand
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {/* Recent Activity */}
            {recentTxns.length > 0 && (
              <>
                <View style={st.sectionHeader}>
                  <Text style={st.sectionTitle}>Recent Activity</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.getParent()?.navigate('ActivityTab')
                    }>
                    <Text style={st.sectionLink}>View All {'\u203A'}</Text>
                  </TouchableOpacity>
                </View>
                {recentTxns.map(tx => {
                  const merch =
                    typeof tx.merchantId === 'object' ? tx.merchantId : null;
                  const isEarn = tx.type === 'earn';
                  const merchLogo = merch ? (merch as any).logo || '🏪' : '🏪';
                  return (
                    <View key={tx._id} style={st.txRow}>
                      <View
                        style={[
                          st.txDot,
                          {
                            backgroundColor: isEarn
                              ? COLORS.earn + '20'
                              : COLORS.redeem + '20',
                          },
                        ]}>
                        <Text style={st.txDotIcon}>{merchLogo}</Text>
                      </View>
                      <View style={st.txInfo}>
                        <Text style={st.txTitle}>
                          {isEarn ? 'Earned' : 'Redeemed'}
                          {merch ? ` at ${(merch as any).name}` : ''}
                        </Text>
                        <Text style={st.txTime}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text
                        style={[
                          st.txPoints,
                          {color: isEarn ? COLORS.earn : COLORS.redeem},
                        ]}>
                        {isEarn ? '+' : '-'}
                        {tx.points}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}

            {/* Quick Actions */}
            <Text style={st.sectionTitle}>Quick Actions</Text>

            {!user?.merchantId && activeRole === 'admin' && (
              <TouchableOpacity
                style={st.onboardRow}
                onPress={() => navigation.navigate('MerchantOnboarding')}
                activeOpacity={0.7}>
                <View style={st.onboardIcon}>
                  <Text style={st.actionIcon}>{'\u{1F680}'}</Text>
                </View>
                <View style={st.actionFlex}>
                  <Text style={st.actionLabel}>Register Your Business</Text>
                  <Text style={st.actionDesc}>
                    Start your own loyalty program with EasyPoints
                  </Text>
                </View>
                <Text style={st.actionArrow}>{'\u203A'}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={st.actionRow}
              onPress={() => navigation.navigate('LinkProgram')}
              activeOpacity={0.7}>
              <View style={st.actionIconWrap}>
                <Text style={st.actionIcon}>{'\u{1F517}'}</Text>
              </View>
              <View style={st.actionFlex}>
                <Text style={st.actionLabel}>Link Programs</Text>
                <Text style={st.actionDesc}>
                  Connect your external loyalty programs
                </Text>
              </View>
              <Text style={st.actionArrow}>{'\u203A'}</Text>
            </TouchableOpacity>

            {/* Share / Referral */}
            <TouchableOpacity
              style={st.shareRow}
              onPress={handleShare}
              activeOpacity={0.7}>
              <Text style={st.shareIcon}>{'\u{1F389}'}</Text>
              <View style={st.actionFlex}>
                <Text style={st.shareTitle}>Invite & Earn 5 EP</Text>
                <Text style={st.shareDesc}>
                  Share your code
                  {user?.referralCode ? ` (${user.referralCode})` : ''} — earn 5
                  EP when they register
                </Text>
              </View>
              <Text style={st.actionArrow}>{'\u203A'}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <RoleSwitcher
        visible={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
      />
    </SafeAreaView>
  );
};

// ─── Donut styles ──────────────────────────────────────
const donutStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  legend: {flex: 1, marginLeft: SPACING.md},
  legendRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  dot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  legendPct: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    minWidth: 32,
    textAlign: 'right',
  },
});

// ─── Main styles ───────────────────────────────────────
const st = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  scroll: {padding: SPACING.lg, paddingBottom: 100},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {flex: 1},
  greeting: {fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text},
  subtitle: {fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2},
  notifBtn: {padding: SPACING.sm, position: 'relative'},
  bellIcon: {fontSize: 22},
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {color: '#FFF', fontSize: 9, fontWeight: '800'},
  roleSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  roleIcon: {fontSize: 20, marginRight: SPACING.sm},
  roleLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  roleSwitchText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  grandTotalCard: {
    backgroundColor: COLORS.text,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  grandTotalLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.xs,
  },
  grandTotalCurrency: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginRight: 6,
  },
  grandTotalBalance: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
  },
  grandTotalSub: {color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.xs},
  syncRow: {flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs},
  syncDot: {color: COLORS.success, fontSize: 8, marginRight: 4},
  syncText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT_SIZE.xs - 1,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  heroBalance: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    marginTop: SPACING.xs,
  },
  heroCurrency: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  expiryBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
  },
  expiryText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  heroAed: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  qrCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  qrCtaIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  qrCtaContent: {
    flex: 1,
  },
  qrCtaLabel: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  qrCtaSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  qrCtaArrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 24,
    marginLeft: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  donutContainer: {marginBottom: SPACING.xs},
  insightsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  insightsRow: {flexDirection: 'row', alignItems: 'center'},
  insightItem: {flex: 1, alignItems: 'center'},
  insightValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.earn,
  },
  insightLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  insightDivider: {width: 1, height: 30, backgroundColor: COLORS.border},
  topMerchant: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  topMerchantLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  topMerchantName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  featuredList: {paddingRight: SPACING.lg},
  featuredCard: {
    width: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.sm + 2,
    marginRight: SPACING.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredLogo: {fontSize: 34, marginBottom: 4},
  featuredName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  featuredRate: {
    fontSize: FONT_SIZE.xs - 1,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  crossBadge: {
    fontSize: FONT_SIZE.xs - 2,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.xs + 2,
  },
  txDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  txDotIcon: {fontSize: 16, fontWeight: '800'},
  txInfo: {flex: 1},
  txTitle: {fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text},
  txTime: {fontSize: FONT_SIZE.xs - 1, color: COLORS.textSecondary},
  txPoints: {fontSize: FONT_SIZE.md, fontWeight: '800'},
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  onboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary + '40',
    borderStyle: 'dashed',
  },
  onboardIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionIcon: {fontSize: 24},
  actionFlex: {flex: 1},
  actionLabel: {fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text},
  actionDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  actionArrow: {
    fontSize: 22,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '08',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary + '25',
  },
  shareIcon: {fontSize: 28, marginRight: SPACING.md},
  shareTitle: {fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text},
  shareDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  switchBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  switchLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
});
