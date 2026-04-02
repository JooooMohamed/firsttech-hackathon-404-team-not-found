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
  Modal,
} from 'react-native';
import {useAuthStore, useMerchantStore, useQrStore} from '../../stores';
import {RoleSwitcher, QrScanner, TextInput, Button} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const StaffHomeScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user, logout} = useAuthStore();
  const {merchants, fetchMerchants} = useMerchantStore();
  const {lookupSession} = useQrStore();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [quickCode, setQuickCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedSession, setScannedSession] = useState<any>(null);

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

  const handleQuickLookup = async (codeValue?: string) => {
    const c = (codeValue || quickCode).trim().toUpperCase();
    if (!c) {
      Alert.alert('Required', 'Enter or scan a member code');
      return;
    }
    try {
      setScanLoading(true);
      const s = await lookupSession(c);
      setScannedSession(s);
      setQuickCode(c);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Code not found');
      setScannedSession(null);
    } finally {
      setScanLoading(false);
    }
  };

  const handleActionFromScan = (action: 'earn' | 'redeem') => {
    const memberId =
      typeof scannedSession.userId === 'object'
        ? scannedSession.userId._id
        : scannedSession.userId;
    const memberName =
      typeof scannedSession.userId === 'object'
        ? scannedSession.userId.name
        : 'Member';

    if (action === 'earn') {
      navigation.navigate('StaffEarn', {
        merchantId: user?.merchantId,
        merchantName,
        earnRate: assignedMerchant?.earnRate || 10,
        prefillCode: quickCode,
      });
    } else {
      navigation.navigate('StaffRedeem', {
        merchantId: user?.merchantId,
        merchantName,
        prefillCode: quickCode,
      });
    }
    // Reset scan state
    setScannedSession(null);
    setQuickCode('');
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
        {/* Header with Quick Edit */}
        <View style={styles.headerSection}>
          <Text style={styles.badge}>{'\uD83C\uDFF7\uFE0F'} Staff Mode</Text>
          <View style={styles.merchantRow}>
            <Text style={styles.title}>{merchantName}</Text>
            {assignedMerchant && assignedMerchant.ownerId === user?._id && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MerchantEdit', {
                    merchantId: user?.merchantId,
                  })
                }
                style={styles.editBtnInline}>
                <Text style={styles.editBtnText}>{'\u270F\uFE0F'} Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.subtitle}>
            {assignedMerchant?.logo || '\uD83C\uDFEA'} Earn Rate:{' '}
            {assignedMerchant?.earnRate || '\u2014'} EP/AED
          </Text>
        </View>

        {/* Quick Scan Section (#19 — scan-first entry) */}
        <View style={styles.scanSection}>
          <Text style={styles.scanSectionTitle}>
            {'\uD83D\uDCF7'} Quick Scan
          </Text>
          <Text style={styles.scanSectionSub}>
            Scan or enter a customer's code to get started
          </Text>
          <View style={styles.scanInputRow}>
            <View style={styles.scanInputWrap}>
              <TextInput
                label=""
                placeholder="Enter code (e.g. ABC123)"
                value={quickCode}
                onChangeText={t => setQuickCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
            <TouchableOpacity
              style={styles.scanCameraBtn}
              onPress={() => setShowScanner(true)}
              activeOpacity={0.7}>
              <Text style={styles.scanCameraBtnText}>{'\uD83D\uDCF7'}</Text>
            </TouchableOpacity>
          </View>
          <Button
            title={scanLoading ? 'Looking up...' : 'Look Up Code'}
            onPress={() => handleQuickLookup()}
            loading={scanLoading}
            variant="secondary"
          />
        </View>

        {/* Scanned Member Info (#18 — show user data + choose action) */}
        {scannedSession && (
          <View style={styles.scannedCard}>
            <View style={styles.scannedHeader}>
              <Text style={styles.scannedAvatar}>{'\uD83D\uDC64'}</Text>
              <View style={styles.scannedInfo}>
                <Text style={styles.scannedName}>
                  {typeof scannedSession.userId === 'object'
                    ? scannedSession.userId.name
                    : 'Member'}
                </Text>
                <Text style={styles.scannedType}>
                  Code: {quickCode} {'\u2022'} Type:{' '}
                  {scannedSession.type || 'earn'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setScannedSession(null);
                  setQuickCode('');
                }}>
                <Text style={styles.scannedClose}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scannedActions}>
              <TouchableOpacity
                style={[
                  styles.scannedActionBtn,
                  {backgroundColor: COLORS.earn || COLORS.success},
                ]}
                onPress={() => handleActionFromScan('earn')}>
                <Text style={styles.scannedActionIcon}>{'\uD83D\uDCB0'}</Text>
                <Text style={styles.scannedActionLabel}>Issue Points</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.scannedActionBtn,
                  {backgroundColor: COLORS.error},
                ]}
                onPress={() => handleActionFromScan('redeem')}>
                <Text style={styles.scannedActionIcon}>{'\uD83C\uDF81'}</Text>
                <Text style={styles.scannedActionLabel}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* QR Scanner Modal */}
        <Modal visible={showScanner} animationType="slide">
          <QrScanner
            title="Scan Customer Code"
            subtitle="Point camera at the customer's QR code"
            onScan={(scannedCode: string) => {
              setShowScanner(false);
              const token = scannedCode.trim().toUpperCase().slice(0, 6);
              setQuickCode(token);
              handleQuickLookup(token);
            }}
            onClose={() => setShowScanner(false)}
          />
        </Modal>

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
    marginBottom: SPACING.md,
  },
  badge: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    flex: 1,
  },
  editBtnInline: {
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: SPACING.sm,
  },
  editBtnText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  /* Quick Scan section */
  scanSection: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  scanSectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  scanSectionSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  scanInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  scanInputWrap: {
    flex: 1,
  },
  scanCameraBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  scanCameraBtnText: {
    fontSize: 22,
  },

  /* Scanned member card */
  scannedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  scannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scannedAvatar: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  scannedInfo: {
    flex: 1,
  },
  scannedName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  scannedType: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scannedClose: {
    fontSize: 18,
    color: COLORS.textSecondary,
    padding: SPACING.sm,
  },
  scannedActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  scannedActionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedActionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  scannedActionLabel: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
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
