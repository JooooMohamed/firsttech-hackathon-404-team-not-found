import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {useAuthStore, useMerchantStore} from '../../stores';
import {RoleSwitcher} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const StaffHomeScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, logout} = useAuthStore();
  const {merchants, fetchMerchants} = useMerchantStore();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await fetchMerchants();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const assignedMerchant = merchants.find(m => m._id === user?.merchantId);
  const merchantName = assignedMerchant?.name || 'Unknown Merchant';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);
  };

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.badge}>🏷️ Staff Mode</Text>
          <Text style={styles.title}>{merchantName}</Text>
          <Text style={styles.subtitle}>
            {assignedMerchant?.logo || '🏪'} Earn Rate:{' '}
            {assignedMerchant?.earnRate || '—'} EP/AED
          </Text>
        </View>

        {/* Action Cards */}
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        {/* Issue Points Card */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('StaffEarn', {
              merchantId: user?.merchantId,
              merchantName,
              earnRate: assignedMerchant?.earnRate || 10,
            })
          }>
          <View style={styles.actionIconWrap}>
            <Text style={styles.actionIcon}>💰</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Issue Points (Earn)</Text>
            <Text style={styles.actionDesc}>
              Customer made a purchase? Enter the bill amount and scan their
              member code to credit EasyPoints to their wallet.
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Validate Redemption Card */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('StaffRedeem', {
              merchantId: user?.merchantId,
              merchantName,
            })
          }>
          <View
            style={[
              styles.actionIconWrap,
              {backgroundColor: COLORS.error + '12'},
            ]}>
            <Text style={styles.actionIcon}>🎁</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Validate Redemption</Text>
            <Text style={styles.actionDesc}>
              Customer wants to spend their EP? Enter their redeem code to
              verify and deduct points from their wallet.
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Manage Staff Card — only for merchant owner */}
        {assignedMerchant && assignedMerchant.ownerId === user?._id && (
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('StaffManagement', {
                merchantId: user?.merchantId,
                merchantName,
              })
            }>
            <View
              style={[
                styles.actionIconWrap,
                {backgroundColor: COLORS.primary + '12'},
              ]}>
              <Text style={styles.actionIcon}>👥</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Staff</Text>
              <Text style={styles.actionDesc}>
                Add or remove team members who can issue and validate points.
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Edit Merchant — only for merchant owner */}
        {assignedMerchant && assignedMerchant.ownerId === user?._id && (
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('MerchantEdit', {
                merchantId: user?.merchantId,
              })
            }>
            <View
              style={[
                styles.actionIconWrap,
                {backgroundColor: COLORS.secondary + '12'},
              ]}>
              <Text style={styles.actionIcon}>✏️</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Edit Merchant Info</Text>
              <Text style={styles.actionDesc}>
                Update name, description, earn rate, and other merchant details.
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* How it works */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>How the flow works</Text>
          <View style={styles.helpStep}>
            <Text style={styles.helpNum}>1</Text>
            <Text style={styles.helpText}>
              <Text style={{fontWeight: '700'}}>Earn:</Text> Customer shows
              their QR code → you scan or enter code + bill amount → points
              credited automatically
            </Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={styles.helpNum}>2</Text>
            <Text style={styles.helpText}>
              <Text style={{fontWeight: '700'}}>Redeem:</Text> Customer
              generates redeem code in their app → you scan or enter the code →
              points deducted
            </Text>
          </View>
        </View>
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
  headerSection: {
    marginBottom: SPACING.lg,
  },
  badge: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  /* Action cards */
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  actionArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },

  /* Help card */
  helpCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 14,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
  },
  helpTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  helpNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  helpText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    lineHeight: 18,
  },
});
