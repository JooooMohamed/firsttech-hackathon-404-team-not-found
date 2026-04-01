import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Animated,
  Vibration,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useQrStore, useNotificationStore} from '../../stores';
import {transactionsApi} from '../../services/api';
import {Button, TextInput, ConfettiOverlay, QrScanner} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

const SuccessResult: React.FC<{
  result: any;
  onDone: () => void;
  type: string;
}> = ({result, onDone, type}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultContainer}>
        <Animated.View
          style={{
            transform: [{scale: scaleAnim}],
            opacity: fadeAnim,
            alignItems: 'center',
          }}>
          <Text style={styles.resultIcon}>✅</Text>
          <Text style={styles.resultTitle}>
            {type === 'earn' ? 'Points Issued!' : 'Redemption Complete!'}
          </Text>
          <Text style={styles.resultPoints}>
            {type === 'earn'
              ? `+${result.totalPoints || result.pointsEarned} EP`
              : `-${result.pointsRedeemed} EP`}
          </Text>
          {type === 'earn' && (
            <>
              <Text style={styles.resultSub}>
                {result.amountAed} AED × {result.earnRate} EP/AED ={' '}
                {result.pointsEarned} EP
              </Text>
              {result.bonusPoints > 0 && (
                <Text
                  style={[
                    styles.resultSub,
                    {color: COLORS.secondary, fontWeight: '700'},
                  ]}>
                  + {result.bonusPoints} bonus EP
                  {result.appliedOffers?.length
                    ? ` (${result.appliedOffers.join(', ')})`
                    : ''}
                </Text>
              )}
            </>
          )}
          <Button
            title="Done"
            onPress={onDone}
            style={{marginTop: SPACING.xl}}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export const EarnScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {merchantId, merchantName, earnRate = 10} = route.params;
  const {lookupSession, completeSession} = useQrStore();

  const [step, setStep] = useState<'amount' | 'code' | 'confirm' | 'result'>(
    'amount',
  );
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleLookup = async () => {
    if (!code.trim()) {
      Alert.alert('Required', 'Enter the member code');
      return;
    }
    try {
      setLoading(true);
      const s = await lookupSession(code.trim().toUpperCase());
      setSession(s);
      setStep('confirm');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Session not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEarn = async () => {
    const amountAed = parseInt(amount, 10);
    if (!amountAed || amountAed <= 0) {
      Alert.alert('Invalid', 'Enter a valid bill amount');
      return;
    }

    try {
      setLoading(true);
      const memberId =
        typeof session.userId === 'object'
          ? session.userId._id
          : session.userId;
      const res = await transactionsApi.earn({
        merchantId,
        userId: memberId,
        amountAed,
        qrToken: session.token,
      });
      await completeSession(session.token);
      setResult(res);
      setStep('result');
      Vibration.vibrate([0, 50, 50, 50]);
      useNotificationStore.getState().addFromTransaction(
        {
          _id: (res as any)._id || res.transaction?._id || '',
          type: 'earn',
          points: res.pointsEarned,
          amountAed: res.amountAed ?? null,
          reference: null,
          merchantId,
          userId: memberId,
          createdAt: new Date().toISOString(),
        },
        merchantName,
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Earn failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'result' && result) {
    return (
      <SuccessResult
        result={result}
        onDone={() => navigation.goBack()}
        type="earn"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>🏷️ {merchantName}</Text>
        <Text style={styles.title}>Issue EasyPoints</Text>

        {/* Step 1: Enter amount */}
        <TextInput
          label="Bill Amount (AED)"
          placeholder="e.g. 50"
          value={amount}
          onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />

        {step === 'amount' && (
          <Button
            title="Next — Enter Member Code"
            onPress={() => {
              if (!parseInt(amount, 10)) {
                Alert.alert('Required', 'Enter the bill amount');
                return;
              }
              setStep('code');
            }}
            variant="secondary"
          />
        )}

        {/* Step 2: Enter member code */}
        {(step === 'code' || step === 'confirm') && (
          <>
            <TextInput
              label="Member Code"
              placeholder="e.g. ABC123"
              value={code}
              onChangeText={t => setCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
            />
            {step === 'code' && (
              <>
                <TouchableOpacity
                  style={styles.scanQrBtn}
                  onPress={() => setShowScanner(true)}
                  activeOpacity={0.7}>
                  <Text style={styles.scanQrBtnText}>
                    📷 Scan QR Code Instead
                  </Text>
                </TouchableOpacity>
                <Button
                  title="Look Up Member"
                  onPress={handleLookup}
                  loading={loading}
                />
              </>
            )}
          </>
        )}

        {/* QR Scanner Modal */}
        <Modal visible={showScanner} animationType="slide">
          <QrScanner
            title="Scan Member QR"
            subtitle="Point camera at the member's QR code"
            onScan={(scannedCode: string) => {
              setShowScanner(false);
              const token = scannedCode.trim().toUpperCase().slice(0, 6);
              setCode(token);
              // Auto-lookup after scan
              setTimeout(async () => {
                try {
                  setLoading(true);
                  const s = await lookupSession(token);
                  setSession(s);
                  setStep('confirm');
                } catch (e: any) {
                  Alert.alert(
                    'Error',
                    e?.response?.data?.message || 'Session not found',
                  );
                } finally {
                  setLoading(false);
                }
              }, 300);
            }}
            onClose={() => setShowScanner(false)}
          />
        </Modal>

        {/* Step 3: Confirm */}
        {step === 'confirm' && session && (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Earn</Text>
            <Text style={styles.confirmRow}>
              Member:{' '}
              {typeof session.userId === 'object'
                ? session.userId.name
                : 'Member'}
            </Text>
            <Text style={styles.confirmRow}>
              Bill: {Math.floor(parseFloat(amount) || 0)} AED
            </Text>
            <Text style={styles.confirmRow}>Earn rate: {earnRate} EP/AED</Text>
            <Text style={styles.confirmRow}>
              Estimated points: ~
              {Math.floor(Math.floor(parseFloat(amount) || 0) * earnRate)} EP
            </Text>
            <Text style={[styles.confirmRow, {fontSize: 11, color: '#999'}]}>
              Final amount may include active offer bonuses
            </Text>
            <Button
              title="Confirm & Issue Points"
              onPress={handleConfirmEarn}
              loading={loading}
              style={{marginTop: SPACING.md}}
            />
          </View>
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
  },
  badge: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  confirmTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  confirmRow: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
  },
  resultPoints: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  resultSub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  scanQrBtn: {
    backgroundColor: COLORS.secondary + '12',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  scanQrBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});
