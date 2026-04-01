import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {useAuthStore, useMerchantStore} from '../../stores';
import {merchantsApi} from '../../services/api';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

const CATEGORIES = [
  'Food & Beverage',
  'Grocery',
  'Fitness',
  'Beauty',
  'Health',
  'Flowers',
  'Retail',
  'Services',
  'Other',
];

export const StaffSettingsScreen: React.FC<{navigation: any}> = ({}) => {
  const {user} = useAuthStore();
  const {merchants, fetchMerchants, updateMerchant} = useMerchantStore();
  const merchant = merchants.find(m => m._id === user?.merchantId);

  // Settings toggles
  const [redemptionEnabled, setRedemptionEnabled] = useState(
    merchant?.redemptionEnabled ?? true,
  );
  const [crossSme, setCrossSme] = useState(
    merchant?.crossSmeRedemption ?? false,
  );

  // Edit fields
  const [name, setName] = useState(merchant?.name || '');
  const [logo, setLogo] = useState(merchant?.logo || '');
  const [category, setCategory] = useState(merchant?.category || '');
  const [description, setDescription] = useState(merchant?.description || '');
  const [earnRate, setEarnRate] = useState(
    merchant?.earnRate?.toString() || '10',
  );
  const [minSpend, setMinSpend] = useState(
    merchant?.minSpend?.toString() || '0',
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      setRedemptionEnabled(merchant.redemptionEnabled);
      setCrossSme(merchant.crossSmeRedemption);
      setName(merchant.name);
      setLogo(merchant.logo || '');
      setCategory(merchant.category || '');
      setDescription(merchant.description || '');
      setEarnRate(merchant.earnRate?.toString() || '10');
      setMinSpend(merchant.minSpend?.toString() || '0');
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

  const handleSaveInfo = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Merchant name is required');
      return;
    }
    const rate = parseInt(earnRate, 10);
    if (!rate || rate < 1) {
      Alert.alert('Invalid', 'Earn rate must be at least 1');
      return;
    }

    setSaving(true);
    try {
      await merchantsApi.update(user?.merchantId || '', {
        name: name.trim(),
        logo: logo.trim(),
        category,
        description: description.trim(),
        earnRate: rate,
        minSpend: parseInt(minSpend, 10) || 0,
      });
      await fetchMerchants();
      Vibration.vibrate(10);
      Alert.alert('Saved', 'Merchant info updated successfully!');
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Failed to update merchant',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!merchant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{fontSize: 48, marginBottom: SPACING.md}}>🏪</Text>
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

        {/* Edit Merchant Info */}
        <Text style={styles.sectionTitle}>MERCHANT INFO</Text>

        <TextInput
          label="Merchant Name"
          placeholder="e.g. Café Beirut"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          label="Logo Emoji"
          placeholder="e.g. ☕"
          value={logo}
          onChangeText={setLogo}
        />

        {/* Category Picker */}
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                category === cat && styles.categoryPillActive,
              ]}
              onPress={() => setCategory(cat)}>
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Description"
          placeholder="Brief description of your business"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInput
          label="Earn Rate (EP per AED)"
          placeholder="e.g. 10"
          value={earnRate}
          onChangeText={t => setEarnRate(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />

        <TextInput
          label="Minimum Spend (AED)"
          placeholder="0 for no minimum"
          value={minSpend}
          onChangeText={t => setMinSpend(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />

        <Button
          title={saving ? 'Saving...' : 'Save Merchant Info'}
          onPress={handleSaveInfo}
          loading={saving}
          style={{marginTop: SPACING.md}}
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
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#FFF',
  },
});
