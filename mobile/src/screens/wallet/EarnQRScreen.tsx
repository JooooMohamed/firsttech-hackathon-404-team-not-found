import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {useQrStore} from '../../stores';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const EarnQRScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {merchantName, token: initialToken, offerTitle} = route.params || {};
  const {createSession} = useQrStore();
  const [token, setToken] = useState(initialToken || '');
  const [loading, setLoading] = useState(!initialToken);
  const [expiresIn, setExpiresIn] = useState(300); // 5 min

  const generateNewSession = () => {
    setLoading(true);
    setExpiresIn(300);
    createSession('general')
      .then(session => {
        setToken(session.token);
        setLoading(false);
      })
      .catch(err => {
        Alert.alert(
          'Error',
          err?.response?.data?.message || 'Failed to create code',
        );
        setLoading(false);
      });
  };

  // Create a generic session on mount if no token provided
  useEffect(() => {
    if (!initialToken) {
      generateNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    if (expiresIn <= 0) {
      return;
    }
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
  }, [expiresIn]);

  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Creating your code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (expiresIn <= 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.expiredIcon}>⏰</Text>
          <Text style={styles.expiredTitle}>Code Expired</Text>
          <Text style={styles.expiredSub}>
            Your code has expired. Generate a new one.
          </Text>
          <TouchableOpacity
            style={[
              styles.doneBtn,
              {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
            ]}
            onPress={generateNewSession}>
            <Text style={[styles.doneBtnText, styles.doneBtnTextWhite]}>
              🔄 Generate New Code
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneBtn, {marginTop: SPACING.sm}]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollCenter}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.earnIcon}>{'\uD83D\uDCF1'}</Text>
        <Text style={styles.title}>Show this to the cashier</Text>
        {merchantName ? (
          <Text style={styles.merchantLabel}>at {merchantName}</Text>
        ) : (
          <Text style={styles.merchantLabel}>at any EasyPoints merchant</Text>
        )}

        {/* Active offer context */}
        {offerTitle && (
          <View style={styles.offerBanner}>
            <Text style={styles.offerBannerText}>
              {'\u26A1'} {offerTitle}
            </Text>
          </View>
        )}

        {/* QR Code */}
        <View style={styles.qrWrap}>
          <QRCode
            value={token}
            size={180}
            color={COLORS.text}
            backgroundColor={COLORS.surface}
          />
        </View>

        {/* Code Display */}
        <View style={styles.codeBox}>
          <Text style={styles.codeText} numberOfLines={1} adjustsFontSizeToFit>
            {token}
          </Text>
        </View>

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

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>How it works:</Text>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>
              Show this code to the staff at checkout
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>
              Staff scans your code to identify you
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>
              Points are earned or redeemed automatically
            </Text>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  earnIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  merchantLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  offerBanner: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  offerBannerText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.warning,
    textAlign: 'center',
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
    borderRadius: 20,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    marginBottom: SPACING.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 4,
    textAlign: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
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
  instructions: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 14,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
  },
  instructionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl || 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  doneBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  doneBtnTextWhite: {
    color: '#FFF',
  },
  expiredIcon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  expiredTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.error,
  },
  expiredSub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
});
