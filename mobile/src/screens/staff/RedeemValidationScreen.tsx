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
              ? `+${result.pointsEarned} EP`
              : `-${result.pointsRedeemed} EP`}
          </Text>
          <Button
            title="Done"
            onPress={onDone}
            style={{marginTop: SPACING.xl}}
          />
        </Animated.View>
      </View>
      <ConfettiOverlay visible={true} />
    </SafeAreaView>
  );
};

export const RedeemValidationScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({navigation, route}) => {
  const {merchantId, merchantName} = route.params;
  const {lookupSession, completeSession} = useQrStore();

  const [step, setStep] = useState<'code' | 'confirm' | 'result'>('code');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleLookup = async () => {
    if (!code.trim()) {
      Alert.alert('Required', 'Enter the member redeem code');
      return;
    }
    try {
      setLoading(true);
      const s = await lookupSession(code.trim().toUpperCase());
      if (s.type !== 'redeem') {
        Alert.alert('Wrong Code', 'This is not a redeem code');
        return;
      }
      setSession(s);
      setStep('confirm');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Session not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRedeem = async () => {
    try {
      setLoading(true);
      const memberId =
        typeof session.userId === 'object'
          ? session.userId._id
          : session.userId;
      const res = await transactionsApi.redeem({
        merchantId,
        userId: memberId,
        points: session.amount,
        qrToken: session.token,
      });
      await completeSession(session.token);
      setResult(res);
      setStep('result');
      Vibration.vibrate([0, 50, 50, 50]);
      useNotificationStore.getState().addFromTransaction(
        {
          _id: (res as any)._id || res.transaction?._id || '',
          type: 'redeem',
          points: res.pointsRedeemed || session.amount,
          amountAed: null,
          reference: null,
          merchantId,
          userId: memberId,
          createdAt: new Date().toISOString(),
        },
        merchantName,
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Redeem failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'result' && result) {
    return (
      <SuccessResult
        result={result}
        onDone={() => navigation.goBack()}
        type="redeem"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>🏷️ {merchantName}</Text>
        <Text style={styles.title}>Validate Redemption</Text>

        <TextInput
          label="Member Redeem Code"
          placeholder="e.g. XYZ789"
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
              <Text style={styles.scanQrBtnText}>📷 Scan QR Code Instead</Text>
            </TouchableOpacity>
            <Button
              title="Look Up Redemption"
              onPress={handleLookup}
              loading={loading}
            />
          </>
        )}

        {/* QR Scanner Modal */}
        <Modal visible={showScanner} animationType="slide">
          <QrScanner
            title="Scan Redeem QR"
            subtitle="Point camera at the member's redeem QR code"
            onScan={(scannedCode: string) => {
              setShowScanner(false);
              const token = scannedCode.trim().toUpperCase().slice(0, 6);
              setCode(token);
              setTimeout(async () => {
                try {
                  setLoading(true);
                  const s = await lookupSession(token);
                  if (s.type !== 'redeem') {
                    Alert.alert('Wrong Code', 'This is not a redeem code');
                    return;
                  }
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

        {step === 'confirm' && session && (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirm Redemption</Text>
            <Text style={styles.confirmRow}>
              Member:{' '}
              {typeof session.userId === 'object'
                ? session.userId.name
                : 'Member'}
            </Text>
            <Text style={styles.confirmRow}>
              Points to redeem: {session.amount} EP
            </Text>
            <Button
              title="Confirm Redemption"
              onPress={handleConfirmRedeem}
              loading={loading}
              variant="danger"
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
    borderColor: COLORS.error,
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
    color: COLORS.error,
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
