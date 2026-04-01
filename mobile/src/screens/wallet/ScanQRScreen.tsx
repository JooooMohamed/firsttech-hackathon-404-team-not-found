import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {QrScanner} from '../../components/QrScanner';
import {transactionsApi, qrApi} from '../../services/api';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

type ScanState = 'scanning' | 'confirming' | 'success' | 'error';

export const ScanQRScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
}) => {
  const [state, setState] = useState<ScanState>('scanning');
  const [sessionData, setSessionData] = useState<any>(null);
  const [earnResult, setEarnResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (code: string) => {
    try {
      Vibration.vibrate(50);
      // The QR code contains a 6-char token from the merchant's earn QR
      const token = code.trim().toUpperCase();

      // Look up the QR session
      const session = await qrApi.lookup(token);

      if (!session) {
        setErrorMsg('Invalid QR code');
        setState('error');
        return;
      }

      if (session.status === 'completed') {
        setErrorMsg('This QR code has already been used');
        setState('error');
        return;
      }

      if (new Date(session.expiresAt) < new Date()) {
        setErrorMsg('This QR code has expired');
        setState('error');
        return;
      }

      setSessionData(session);
      setState('confirming');
    } catch (e: any) {
      setErrorMsg(
        e?.response?.data?.message || 'Failed to read QR code. Try again.',
      );
      setState('error');
    }
  };

  const handleConfirmEarn = async () => {
    if (!sessionData) {
      return;
    }
    try {
      const merchant =
        typeof sessionData.merchantId === 'object'
          ? sessionData.merchantId
          : null;
      const merchantName = merchant?.name || 'Merchant';

      const result = await transactionsApi.earn({
        merchantId:
          typeof sessionData.merchantId === 'object'
            ? sessionData.merchantId._id
            : sessionData.merchantId,
        userId: sessionData.userId?.toString() || '',
        amountAed: sessionData.amount || 0,
        qrToken: sessionData.token,
      });

      setEarnResult({...result, merchantName});
      setState('success');
      Vibration.vibrate([0, 100, 50, 100]);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || 'Failed to earn points');
      setState('error');
    }
  };

  if (state === 'scanning') {
    return (
      <QrScanner
        onScan={handleScan}
        onClose={() => navigation.goBack()}
        title="Scan Merchant QR"
        subtitle="Scan the cashier's QR code to earn points"
      />
    );
  }

  if (state === 'confirming' && sessionData) {
    const merchant =
      typeof sessionData.merchantId === 'object'
        ? sessionData.merchantId
        : null;
    const merchantName = merchant?.name || 'Merchant';
    const merchantLogo = merchant?.logo || '🏪';
    const amount = sessionData.amount || 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.title}>Confirm Earn</Text>

          <View style={styles.card}>
            <Text style={styles.cardLogo}>{merchantLogo}</Text>
            <Text style={styles.cardName}>{merchantName}</Text>
            <View style={styles.divider} />
            <Text style={styles.amountLabel}>Bill Amount</Text>
            <Text style={styles.amount}>{Math.floor(amount)} AED</Text>
            <View style={styles.divider} />
            <Text style={styles.pointsLabel}>You'll earn approximately</Text>
            <Text style={styles.points}>
              {Math.floor(amount * (merchant?.earnRate || 10))} EP
            </Text>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmEarn}>
            <Text style={styles.confirmBtnText}>Confirm & Earn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setState('scanning')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'success' && earnResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Points Earned!</Text>
          <Text style={styles.successPoints}>
            +{earnResult.totalPoints || earnResult.pointsEarned} EP
          </Text>
          {earnResult.merchantName && (
            <Text style={styles.successMerchant}>
              at {earnResult.merchantName}
            </Text>
          )}
          {earnResult.appliedOffers && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>
                🎁 Bonus: {earnResult.appliedOffers.join(', ')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMsg}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setErrorMsg('');
            setState('scanning');
          }}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  icon: {fontSize: 56, marginBottom: SPACING.md},
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLogo: {fontSize: 40, marginBottom: SPACING.sm},
  cardName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  amountLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  pointsLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  points: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 14,
    marginBottom: SPACING.sm,
    width: '100%',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  successIcon: {fontSize: 72, marginBottom: SPACING.md},
  successTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  successPoints: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  successMerchant: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  offerBadge: {
    backgroundColor: COLORS.secondary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    marginBottom: SPACING.lg,
  },
  offerBadgeText: {
    color: COLORS.secondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  errorIcon: {fontSize: 56, marginBottom: SPACING.md},
  errorTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  errorMsg: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 14,
    marginBottom: SPACING.sm,
    width: '100%',
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
});
