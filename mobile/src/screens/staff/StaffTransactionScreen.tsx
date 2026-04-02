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
} from 'react-native';
import {useQrStore, useNotificationStore} from '../../stores';
import {transactionsApi} from '../../services/api';
import {Button, TextInput, ConfettiOverlay} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

// ─── Success Result ────────────────────────────────────
const SuccessResult: React.FC<{
  result: any;
  onDone: () => void;
  type: 'earn' | 'redeem';
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
          <Text style={styles.resultIcon}>
            {type === 'earn' ? '\u2705' : '\uD83C\uDF81'}
          </Text>
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
                {result.amountAed} AED \u00D7 {result.earnRate} EP/AED ={' '}
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
      {type === 'redeem' && <ConfettiOverlay visible={true} />}
    </SafeAreaView>
  );
};

// ─── Main Screen ───────────────────────────────────────
export const StaffTransactionScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({navigation, route}) => {
  const {
    merchantId,
    merchantName,
    earnRate = 10,
    memberName,
    memberBalance = 0,
    qrToken,
  } = route.params;

  const {completeSession} = useQrStore();

  const [action, setAction] = useState<'earn' | 'redeem' | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<'choose' | 'amount' | 'confirm' | 'result'>(
    'choose',
  );

  const memberId = route.params.memberId;

  const handleSelectAction = (a: 'earn' | 'redeem') => {
    setAction(a);
    setStep('amount');
  };

  const numAmount = parseInt(amount, 10) || 0;

  const estimatedPoints =
    action === 'earn' ? Math.floor(numAmount * earnRate) : numAmount;

  const handleConfirm = async () => {
    if (!numAmount || numAmount <= 0) {
      Alert.alert(
        'Required',
        action === 'earn'
          ? 'Enter the bill amount'
          : 'Enter the points to redeem',
      );
      return;
    }

    if (action === 'redeem' && numAmount > memberBalance) {
      Alert.alert(
        'Insufficient Points',
        `Member only has ${memberBalance} EP available.`,
      );
      return;
    }

    try {
      setLoading(true);

      if (action === 'earn') {
        const res = await transactionsApi.earn({
          merchantId,
          userId: memberId,
          amountAed: numAmount,
          qrToken,
        });
        if (qrToken) {
          await completeSession(qrToken).catch(() => {});
        }
        setResult(res);
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
      } else {
        const res = await transactionsApi.redeem({
          merchantId,
          userId: memberId,
          points: numAmount,
          qrToken,
        });
        if (qrToken) {
          await completeSession(qrToken).catch(() => {});
        }
        setResult(res);
        Vibration.vibrate([0, 50, 50, 50]);
        useNotificationStore.getState().addFromTransaction(
          {
            _id: (res as any)._id || res.transaction?._id || '',
            type: 'redeem',
            points: res.pointsRedeemed || numAmount,
            amountAed: null,
            reference: null,
            merchantId,
            userId: memberId,
            createdAt: new Date().toISOString(),
          },
          merchantName,
        );
      }

      setStep('result');
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Transaction failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Result screen ───
  if (step === 'result' && result && action) {
    return (
      <SuccessResult
        result={result}
        onDone={() => navigation.goBack()}
        type={action}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.badge}>
          {'\uD83C\uDFF7\uFE0F'} {merchantName}
        </Text>

        {/* Member Info Card */}
        <View style={styles.memberCard}>
          <Text style={styles.memberAvatar}>{'\uD83D\uDC64'}</Text>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{memberName}</Text>
            <Text style={styles.memberBalance}>
              Balance: {memberBalance.toLocaleString()} EP
            </Text>
          </View>
        </View>

        {/* Step: Choose Action */}
        {step === 'choose' && (
          <>
            <Text style={styles.stepTitle}>What would you like to do?</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, {backgroundColor: COLORS.earn || COLORS.success}]}
                activeOpacity={0.7}
                onPress={() => handleSelectAction('earn')}>
                <Text style={styles.actionBtnIcon}>{'\uD83D\uDCB0'}</Text>
                <Text style={styles.actionBtnLabel}>Issue Points</Text>
                <Text style={styles.actionBtnSub}>Customer made a purchase</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor:
                      memberBalance > 0 ? COLORS.error : COLORS.textSecondary,
                    opacity: memberBalance > 0 ? 1 : 0.5,
                  },
                ]}
                activeOpacity={0.7}
                disabled={memberBalance === 0}
                onPress={() => handleSelectAction('redeem')}>
                <Text style={styles.actionBtnIcon}>{'\uD83C\uDF81'}</Text>
                <Text style={styles.actionBtnLabel}>Redeem Points</Text>
                <Text style={styles.actionBtnSub}>
                  {memberBalance > 0
                    ? 'Customer wants to spend EP'
                    : 'No points available'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Step: Enter Amount */}
        {(step === 'amount' || step === 'confirm') && action && (
          <>
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => {
                setStep('choose');
                setAction(null);
                setAmount('');
              }}>
              <Text style={styles.backLinkText}>
                {'\u2190'} Change action
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.actionHeader,
                {
                  backgroundColor:
                    action === 'earn'
                      ? (COLORS.earn || COLORS.success) + '12'
                      : COLORS.error + '12',
                },
              ]}>
              <Text style={styles.actionHeaderIcon}>
                {action === 'earn' ? '\uD83D\uDCB0' : '\uD83C\uDF81'}
              </Text>
              <Text
                style={[
                  styles.actionHeaderText,
                  {
                    color:
                      action === 'earn'
                        ? COLORS.earn || COLORS.success
                        : COLORS.error,
                  },
                ]}>
                {action === 'earn'
                  ? 'Issue Points to ' + memberName
                  : 'Redeem Points for ' + memberName}
              </Text>
            </View>

            <TextInput
              label={
                action === 'earn' ? 'Bill Amount (AED)' : 'Points to Redeem'
              }
              placeholder={action === 'earn' ? 'e.g. 50' : 'e.g. 500'}
              value={amount}
              onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />

            {numAmount > 0 && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Preview</Text>
                {action === 'earn' ? (
                  <Text style={styles.previewText}>
                    {numAmount} AED \u00D7 {earnRate} EP/AED ={' '}
                    <Text style={{fontWeight: '900', color: COLORS.earn || COLORS.success}}>
                      ~{estimatedPoints} EP
                    </Text>
                  </Text>
                ) : (
                  <>
                    <Text style={styles.previewText}>
                      Deducting{' '}
                      <Text style={{fontWeight: '900', color: COLORS.error}}>
                        {numAmount} EP
                      </Text>{' '}
                      from {memberName}
                    </Text>
                    {numAmount > memberBalance && (
                      <Text style={styles.previewError}>
                        {'\u26A0\uFE0F'} Exceeds balance ({memberBalance} EP)
                      </Text>
                    )}
                  </>
                )}
              </View>
            )}

            <Button
              title={
                action === 'earn'
                  ? `Confirm \u2014 Issue ~${estimatedPoints} EP`
                  : `Confirm \u2014 Redeem ${numAmount || 0} EP`
              }
              onPress={handleConfirm}
              loading={loading}
              style={{marginTop: SPACING.md}}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  scroll: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  badge: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },

  /* Member card */
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  memberAvatar: {fontSize: 36, marginRight: SPACING.md},
  memberInfo: {flex: 1},
  memberName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  memberBalance: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  /* Action choice */
  stepTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  actionBtnIcon: {fontSize: 32, marginBottom: SPACING.sm},
  actionBtnLabel: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  actionBtnSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
    textAlign: 'center',
  },

  /* Back link */
  backLink: {marginBottom: SPACING.md},
  backLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },

  /* Action header */
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionHeaderIcon: {fontSize: 24, marginRight: SPACING.sm},
  actionHeaderText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    flex: 1,
  },

  /* Preview */
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  previewLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  previewError: {
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    fontWeight: '600',
  },

  /* Result */
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  resultIcon: {fontSize: 64, marginBottom: SPACING.md},
  resultTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultPoints: {
    fontSize: FONT_SIZE.hero,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  resultSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
