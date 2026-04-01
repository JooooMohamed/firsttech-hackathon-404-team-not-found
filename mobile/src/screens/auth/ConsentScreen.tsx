import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useAuthStore} from '../../stores';
import {Button} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const ConsentScreen: React.FC = () => {
  const {giveConsent, logout} = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={logout}>
        <Text style={styles.backText}>← Sign Out</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Data Consent</Text>
        <Text style={styles.body}>
          EasyPoints aggregates your loyalty program balances from participating
          UAE programs into one unified wallet view.
          {'\n\n'}
          By continuing, you agree to let EasyPoints display your program
          balances (read-only) and manage EasyPoints earned at partner
          merchants.{'\n\n'}
          Your data is never shared with third parties.
        </Text>

        <Button
          title="I Agree — Let's Go"
          onPress={giveConsent}
          style={{marginTop: SPACING.xl}}
        />

        <Text style={styles.disclaimer}>
          You can revoke consent at any time in Settings.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  backText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  body: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
