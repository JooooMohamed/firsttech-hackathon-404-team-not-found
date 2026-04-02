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
  }, [fetchMerchants]);

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
    const memberName =
      typeof scannedSession.userId === 'object'
        ? scannedSession.userId.name
        : 'Member';
    const memberId =
      typeof scannedSession.userId === 'object'
        ? scannedSession.userId._id
        : scannedSession.userId;
    const memberBalance = scannedSession.easyPointsBalance ?? 0;

    navigation.navigate('StaffTransaction', {
      merchantId: user?.merchantId,
      merchantName,
      earnRate: assignedMerchant?.earnRate || 10,
      memberName,
      memberId,
      memberBalance,
      qrToken: quickCode,
    });

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

        {/* Scanned Member Info — show user data + balance */}
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
                <Text style={styles.scannedBalance}>
                  Balance:{' '}
                  {(scannedSession.easyPointsBalance ?? 0).toLocaleString()} EP
                </Text>
                <Text style={styles.scannedType}>Code: {quickCode}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setScannedSession(null);
                  setQuickCode('');
                }}>
                <Text style={styles.scannedClose}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.continueBtn}
              activeOpacity={0.7}
              onPress={() => handleActionFromScan('earn')}>
              <Text style={styles.continueBtnText}>Continue {'\u2192'}</Text>
            </TouchableOpacity>
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

        {/* Manage Staff — only for merchant owner */}
        {assignedMerchant && assignedMerchant.ownerId === user?._id && (
          <>
            <Text style={styles.sectionTitle}>Management</Text>
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
                <Text style={styles.actionIcon}>{'\uD83D\uDC65'}</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Manage Staff</Text>
                <Text style={styles.actionDesc}>
                  Add or remove team members who can issue and validate points.
                </Text>
              </View>
              <Text style={styles.actionArrow}>{'\u203A'}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* How it works */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>How the flow works</Text>
          <View style={styles.helpStep}>
            <Text style={styles.helpNum}>1</Text>
            <Text style={styles.helpText}>Customer shows their QR code</Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={styles.helpNum}>2</Text>
            <Text style={styles.helpText}>
              You scan or enter the code above
            </Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={styles.helpNum}>3</Text>
            <Text style={styles.helpText}>
              Choose Earn or Redeem, enter amount, done!
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
  scannedBalance: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
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
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
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
