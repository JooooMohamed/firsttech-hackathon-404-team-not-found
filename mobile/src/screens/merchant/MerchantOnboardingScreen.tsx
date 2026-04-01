import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useAuthStore} from '../../stores';
import {merchantsApi, usersApi} from '../../services/api';
import {Button, TextInput} from '../../components';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

const CATEGORIES = [
  'Food & Beverage',
  'Grocery',
  'Fashion',
  'Beauty & Spa',
  'Gifts & Flowers',
  'Electronics',
  'Health & Fitness',
  'Other',
];

const LOGOS = ['☕', '🛒', '🌸', '👗', '💈', '💎', '🍕', '🏪', '🎮', '💪'];

export const MerchantOnboardingScreen: React.FC<{navigation: any}> = ({
  navigation,
}) => {
  const {setUser} = useAuthStore();
  const [step, setStep] = useState<'info' | 'rules' | 'review'>('info');
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('🏪');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [earnRate, setEarnRate] = useState('10');
  const [minSpend, setMinSpend] = useState('0');
  const [bonusMultiplier, setBonusMultiplier] = useState('1');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await merchantsApi.register({
        name,
        logo,
        category,
        description,
        earnRate: parseInt(earnRate, 10) || 10,
        minSpend: parseInt(minSpend, 10) || 0,
        bonusMultiplier: parseFloat(bonusMultiplier) || 1,
      });

      // Refresh user profile (roles + merchantId changed)
      const freshUser = await usersApi.getMe();
      setUser(freshUser);

      Alert.alert(
        '🎉 Welcome Aboard!',
        `${res.merchant.name} is now live on EasyPoints! Switch to Staff mode to start issuing points.`,
        [
          {
            text: 'Got it!',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Failed to register merchant',
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Business Info
  if (step === 'info') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.stepLabel}>Step 1 of 3</Text>
            <Text style={styles.title}>Tell us about your business</Text>
            <Text style={styles.subtitle}>
              Register your SME to start earning loyalty with EasyPoints
            </Text>

            <TextInput
              label="Business Name *"
              placeholder="e.g. My Café"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>Logo Emoji</Text>
            <View style={styles.logoRow}>
              {LOGOS.map(l => (
                <Text
                  key={l}
                  style={[styles.logoOption, logo === l && styles.logoSelected]}
                  onPress={() => setLogo(l)}>
                  {l}
                </Text>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map(c => (
                <Text
                  key={c}
                  style={[
                    styles.catPill,
                    category === c && styles.catPillActive,
                  ]}
                  onPress={() => setCategory(c)}>
                  {c}
                </Text>
              ))}
            </View>

            <TextInput
              label="Description"
              placeholder="What makes your business special?"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Button
              title="Next: Earn Rules →"
              onPress={() => {
                if (!name.trim()) {
                  Alert.alert('Required', 'Please enter your business name');
                  return;
                }
                setStep('rules');
              }}
              style={{marginTop: SPACING.md}}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // Step 2: Earn Rules
  if (step === 'rules') {
    const previewPoints = Math.floor(
      100 * (parseInt(earnRate, 10) || 10) * (parseFloat(bonusMultiplier) || 1),
    );

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.stepLabel}>Step 2 of 3</Text>
            <Text style={styles.title}>Set your earn rules</Text>
            <Text style={styles.subtitle}>
              Define how customers earn EasyPoints at your store
            </Text>

            <TextInput
              label="Earn Rate (EP per AED) *"
              placeholder="10"
              value={earnRate}
              onChangeText={setEarnRate}
              keyboardType="number-pad"
            />

            <TextInput
              label="Minimum Spend (AED)"
              placeholder="0 (no minimum)"
              value={minSpend}
              onChangeText={setMinSpend}
              keyboardType="number-pad"
            />

            <TextInput
              label="Bonus Multiplier"
              placeholder="1 (no bonus)"
              value={bonusMultiplier}
              onChangeText={setBonusMultiplier}
              keyboardType="decimal-pad"
            />

            {/* Preview Card */}
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>📊 Preview</Text>
              <Text style={styles.previewText}>
                A customer spending{' '}
                <Text style={styles.previewBold}>100 AED</Text> earns{' '}
                <Text style={styles.previewBoldSecondary}>
                  {previewPoints} EP
                </Text>
              </Text>
              {parseInt(minSpend, 10) > 0 && (
                <Text style={styles.previewText}>
                  Min spend: {minSpend} AED
                </Text>
              )}
              {parseFloat(bonusMultiplier) > 1 && (
                <Text style={styles.previewText}>
                  Bonus: {bonusMultiplier}× multiplier active
                </Text>
              )}
            </View>

            <View style={styles.btnRow}>
              <Button
                title="← Back"
                variant="outline"
                onPress={() => setStep('info')}
                style={styles.flex1}
              />
              <Button
                title="Next: Review →"
                onPress={() => setStep('review')}
                style={styles.flex1}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // Step 3: Review
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.stepLabel}>Step 3 of 3</Text>
        <Text style={styles.title}>Review & Launch</Text>
        <Text style={styles.subtitle}>
          Everything look good? You can change settings later.
        </Text>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewLogo}>{logo}</Text>
          <Text style={styles.reviewName}>{name}</Text>
          {category ? <Text style={styles.reviewCat}>{category}</Text> : null}
          {description ? (
            <Text style={styles.reviewDesc}>{description}</Text>
          ) : null}

          <View style={styles.reviewDivider} />

          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Earn Rate</Text>
            <Text style={styles.reviewValue}>{earnRate} EP/AED</Text>
          </View>
          {parseInt(minSpend, 10) > 0 && (
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Min Spend</Text>
              <Text style={styles.reviewValue}>{minSpend} AED</Text>
            </View>
          )}
          {parseFloat(bonusMultiplier) > 1 && (
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Bonus</Text>
              <Text style={styles.reviewValue}>{bonusMultiplier}×</Text>
            </View>
          )}
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Cross-SME Redeem</Text>
            <Text style={styles.reviewValue}>✅ Enabled</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <Button
            title="← Back"
            variant="outline"
            onPress={() => setStep('rules')}
            style={styles.flex1}
          />
          <Button
            title="🚀 Launch!"
            onPress={handleSubmit}
            loading={loading}
            style={styles.flex1}
          />
        </View>
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
    paddingBottom: SPACING.xxl,
  },
  stepLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  logoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  logoOption: {
    fontSize: 28,
    padding: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  logoSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  catPill: {
    fontSize: FONT_SIZE.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textSecondary,
    overflow: 'hidden',
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: '#FFF',
  },
  previewCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 14,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  previewTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  previewText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewLogo: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  reviewName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
  },
  reviewCat: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  reviewDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'stretch',
    marginVertical: SPACING.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: SPACING.xs,
  },
  reviewLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  reviewValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  flex1: {
    flex: 1,
  },
  previewBold: {
    fontWeight: '800',
  },
  previewBoldSecondary: {
    fontWeight: '800',
    color: COLORS.secondary,
  },
});
