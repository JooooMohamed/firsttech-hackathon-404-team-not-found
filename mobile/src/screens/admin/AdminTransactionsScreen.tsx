import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {transactionsApi} from '../../services/api';
import {Transaction} from '../../types';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const AdminTransactionsScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({route}) => {
  const {merchantId, merchantName, filter = 'all'} = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(filter);

  const load = async () => {
    setLoading(true);
    try {
      const data = await transactionsApi.getMerchantTransactions(merchantId);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  // Apply filter
  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'earn') {
      return t.type === 'earn';
    }
    if (activeFilter === 'redeem') {
      return t.type === 'redeem';
    }
    return true; // 'all' and 'members' show everything
  });

  // For members tab, extract unique members
  const uniqueMembers =
    activeFilter === 'members'
      ? Array.from(
          new Map(
            transactions.map(t => {
              const userId =
                typeof t.userId === 'object' ? (t.userId as any)._id : t.userId;
              const name =
                typeof t.userId === 'object' ? (t.userId as any).name : '—';
              const email =
                typeof t.userId === 'object' ? (t.userId as any).email : '';
              return [userId, {id: userId, name, email}];
            }),
          ).values(),
        )
      : [];

  const filterTabs = [
    {key: 'all', label: 'All', icon: '📊'},
    {key: 'earn', label: 'Earned', icon: '▲'},
    {key: 'redeem', label: 'Redeemed', icon: '▼'},
    {key: 'members', label: 'Members', icon: '👥'},
  ];

  const renderMemberItem = ({
    item,
  }: {
    item: {id: string; name: string; email: string};
  }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {item.email ? (
          <Text style={styles.memberEmail}>{item.email}</Text>
        ) : null}
      </View>
      <Text style={styles.memberTxCount}>
        {
          transactions.filter(t => {
            const uid =
              typeof t.userId === 'object' ? (t.userId as any)._id : t.userId;
            return uid === item.id;
          }).length
        }{' '}
        txns
      </Text>
    </View>
  );

  const renderItem = ({item}: {item: Transaction}) => {
    const isEarn = item.type === 'earn';
    const memberName =
      typeof item.userId === 'object' ? (item.userId as any).name : '—';
    return (
      <View style={styles.txnCard}>
        <View style={styles.txnLeft}>
          <Text
            style={[
              styles.txnIcon,
              {color: isEarn ? COLORS.success : COLORS.error},
            ]}>
            {isEarn ? '▲' : '▼'}
          </Text>
          <View>
            <Text style={styles.txnType}>{isEarn ? 'Earn' : 'Redeem'}</Text>
            <Text style={styles.txnMember}>{memberName}</Text>
          </View>
        </View>
        <View style={styles.txnRight}>
          <Text
            style={[
              styles.txnPoints,
              {color: isEarn ? COLORS.success : COLORS.error},
            ]}>
            {isEarn ? '+' : '-'}
            {item.points} EP
          </Text>
          {item.amountAed ? (
            <Text style={styles.txnAmount}>{item.amountAed} AED</Text>
          ) : null}
          <Text style={styles.txnDate}>
            {new Date(item.createdAt).toLocaleDateString('en-AE', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(tab.key)}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.key && styles.filterTabTextActive,
              ]}>
              {tab.icon} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeFilter === 'members' ? (
        <FlatList
          data={uniqueMembers}
          keyExtractor={item => item.id}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>{merchantName}</Text>
              <Text style={styles.subtitle}>
                {uniqueMembers.length} active member
                {uniqueMembers.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>No members yet</Text>}
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>{merchantName}</Text>
              <Text style={styles.subtitle}>
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? 's' : ''}
                {activeFilter !== 'all'
                  ? ` (${activeFilter === 'earn' ? 'Earned' : 'Redeemed'})`
                  : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No transactions yet</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: SPACING.lg,
  },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  txnIcon: {
    fontSize: 18,
    fontWeight: '900',
  },
  txnType: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  txnMember: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnPoints: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  txnAmount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  txnDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: SPACING.xxl,
    fontSize: FONT_SIZE.md,
  },
  /* Filter Tabs */
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#F0F0F0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  /* Member cards */
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  memberAvatarText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  memberEmail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  memberTxCount: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
