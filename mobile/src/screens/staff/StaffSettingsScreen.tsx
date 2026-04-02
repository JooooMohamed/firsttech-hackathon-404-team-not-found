import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Vibration,
} from 'react-native';
import {useAuthStore, useMerchantStore} from '../../stores';
import {Button} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

export const StaffSettingsScreen: React.FC<{navigation: any}> = ({}) => {
  const {user} = useAuthStore();
  const {merchants, updateMerchant} = useMerchantStore();
  const merchant = merchants.find(m => m._id === user?.merchantId);

  // Settings toggles
  const [redemptionEnabled, setRedemptionEnabled] = useState(
    merchant?.redemptionEnabled ?? true,
  );
  const [crossSme, setCrossSme] = useState(
    merchant?.crossSmeRedemption ?? false,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      setRedemptionEnabled(merchant.redemptionEnabled);
      setCrossSme(merchant.crossSmeRedemption);
    }
  }, [merchant]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateMerchant(user?.merchantId || '', {
        redemptionEnabled,
        crossSmeRedemption: crossSme,
      });
      Vibration.vibrate(10);
      Alert.alert('Saved', 'Settings updated successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!merchant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={settingsInlineStyles.merchantIcon}>🏪</Text>
          <Text style={{fontSize: FONT_SIZE.md, color: COLORS.textSecondary}}>
            No merchant assigned
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Merchant Settings</Text>

        {/* Settings Toggles */}
        <Text style={styles.sectionTitle}>POINT SETTINGS</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Redemption Enabled</Text>
            <Text style={styles.settingDesc}>
              Allow members to redeem EasyPoints at your store
            </Text>
          </View>
          <Switch
            value={redemptionEnabled}
            onValueChange={setRedemptionEnabled}
            trackColor={{true: COLORS.primary}}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Cross-SME Redemption</Text>
            <Text style={styles.settingDesc}>
              Allow points earned at other merchants to be redeemed here
            </Text>
          </View>
          <Switch
            value={crossSme}
            onValueChange={setCrossSme}
            trackColor={{true: COLORS.primary}}
          />
        </View>

        <Button
          title={saving ? 'Saving...' : 'Save Settings'}
          onPress={handleSaveSettings}
          loading={saving}
          style={{marginTop: SPACING.sm, marginBottom: SPACING.xl}}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const settingsInlineStyles = StyleSheet.create({
  merchantIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  pageTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
