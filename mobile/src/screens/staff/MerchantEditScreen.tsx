import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import {useMerchantStore} from '../../stores';
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

export const MerchantEditScreen: React.FC<{navigation: any; route: any}> = ({
  navigation,
  route,
}) => {
  const {merchantId} = route.params;
  const {merchants, fetchMerchants} = useMerchantStore();
  const merchant = merchants.find(m => m._id === merchantId);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Merchant name is required');
      return;
    }
    const rate = parseInt(earnRate, 10);
    if (!rate || rate < 1) {
      Alert.alert('Invalid', 'Earn rate must be at least 1');
      return;
    }

    try {
      setSaving(true);
      await merchantsApi.update(merchantId, {
        name: name.trim(),
        logo: logo.trim(),
        category,
        description: description.trim(),
        earnRate: rate,
        minSpend: parseInt(minSpend, 10) || 0,
      });
      await fetchMerchants();
      Vibration.vibrate(10);
      Alert.alert('Saved', 'Merchant info updated successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
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
          <Text>Merchant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Merchant</Text>
        <Text style={styles.subtitle}>Update your merchant info below</Text>

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
          title={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
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
  backBtn: {
    marginBottom: SPACING.sm,
  },
  backArrow: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '700',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
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
