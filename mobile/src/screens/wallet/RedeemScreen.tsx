import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useWalletStore, useQrStore} from '../../stores';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const RedeemScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {merchantId, merchantName} = route.params;
  const {easyPointsBalance, epAedRate} = useWalletStore();
  const {createSession, activeSession} = useQrStore();
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [expiresIn, setExpiresIn] = useState(300); // 5 min

  const handleCreateSession = async () => {
    const num = parseInt(points, 10);
    if (!num || num <= 0) {
      Alert.alert('Invalid', 'Enter a valid number of points');
      return;
    }
    if (num > easyPointsBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You only have ${easyPointsBalance} EP`,
      );
      return;
    }

    try {
      setLoading(true);
      const session = await createSession('redeem', merchantId, num);
      setSessionCreated(true);
      // Sync timer from server expiresAt
      if (session?.expiresAt) {
        const remaining = Math.max(
          0,
          Math.floor(
            (new Date(session.expiresAt).getTime() - Date.now()) / 1000,
          ),
        );
        setExpiresIn(remaining);
      } else {
        setExpiresIn(300);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create redeem session');
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for redeem code
  useEffect(() => {
    if (!sessionCreated || expiresIn <= 0) return;
    const timer = setInterval(() => {
      setExpiresIn(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionCreated, expiresIn]);

  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;

  // Expired state — show regenerate button
  if (sessionCreated && expiresIn <= 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.qrContainer}>
          <Text style={{fontSize: 56, marginBottom: SPACING.md}}>⏰</Text>
          <Text style={[styles.qrTitle, {color: COLORS.error}]}>
            Code Expired
          </Text>
          <Text style={styles.qrHint}>
            Your redeem code has expired. Generate a new one to continue.
          </Text>
          <Button
            title="🔄 Generate New Code"
            onPress={() => {
              setSessionCreated(false);
              setExpiresIn(300);
            }}
            style={{marginTop: SPACING.xl}}
          />
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{marginTop: SPACING.sm}}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (sessionCreated && activeSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Show this to staff</Text>
          <View style={styles.qrWrap}>
            <QRCode
              value={activeSession.token}
              size={180}
              color={COLORS.text}
              backgroundColor={COLORS.surface}
            />
          </View>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{activeSession.token}</Text>
          </View>
          <Text style={styles.qrSub}>
            Redeeming {activeSession.amount} EP at {merchantName}
          </Text>
          {/* Timer */}
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Expires in</Text>
            <Text
              style={[
                styles.timerValue,
                expiresIn < 60 && {color: COLORS.error},
              ]}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </Text>
          </View>
          <Text style={styles.qrHint}>
            Give this code to the merchant staff to complete redemption
          </Text>
          <Button
            title="Done"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{marginTop: SPACING.xl}}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Redeem at {merchantName}</Text>
        <Text style={styles.balance}>
          Available: {easyPointsBalance.toLocaleString()} EP
        </Text>

        <TextInput
          label="Points to redeem"
          placeholder="e.g. 200"
          value={points}
          onChangeText={setPoints}
          keyboardType="number-pad"
        />

        {/* Point Conversion Preview */}
        {points && parseInt(points, 10) > 0 && (
          <View style={styles.conversionPreview}>
            <Text style={styles.conversionIcon}>{'\u{1F4B1}'}</Text>
            <View style={{flex: 1}}>
              <Text style={styles.conversionValue}>
                {parseInt(points, 10).toLocaleString()} EP {'\u2248'} AED{' '}
                {(parseInt(points, 10) * epAedRate).toFixed(2)}
              </Text>
              <Text style={styles.conversionRate}>
                Rate: 1 EP = AED {epAedRate}
              </Text>
            </View>
          </View>
        )}

        <Button
          title="Generate Redeem Code"
          onPress={handleCreateSession}
          loading={loading}
          disabled={!points}
        />
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
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  balance: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  qrTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  qrWrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  codeBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  qrSub: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: SPACING.lg,
  },
  qrHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timerLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  timerValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  conversionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.secondary + '25',
  },
  conversionIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  conversionValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  conversionRate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
