import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {useMerchantStore, useWalletStore} from '../../stores';
import {COLORS, SPACING, FONT_SIZE} from '../../constants';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const MerchantProfileScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({navigation, route}) => {
  const {merchantId} = route.params;
  const {selectedMerchant, selectMerchant} = useMerchantStore();
  const {easyPointsBalance} = useWalletStore();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMerchant || selectedMerchant._id !== merchantId) {
      const {merchants} = useMerchantStore.getState();
      const m = merchants.find(m => m._id === merchantId);
      if (m) selectMerchant(m);
    }
  }, [merchantId]);

  const merchant = selectedMerchant;
  if (!merchant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 48, marginBottom: SPACING.md}}>🏪</Text>
          <Text
            style={{
              fontSize: FONT_SIZE.lg,
              fontWeight: '700',
              color: COLORS.text,
            }}>
            Loading merchant...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCard = (card: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCard(prev => (prev === card ? null : card));
  };

  const handleRedeem = async () => {
    // Unused — kept for backward compat
  };

  const handleEarnQr = async () => {
    // Navigate to generic QR screen — no merchant-specific session needed
    navigation.navigate('EarnQR', {
      merchantName: merchant.name,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>{merchant.logo || '🏪'}</Text>
          <Text style={styles.name}>{merchant.name}</Text>
          <Text style={styles.category}>{merchant.category}</Text>
        </View>

        {/* About - expandable */}
        <TouchableOpacity
          style={[styles.card, expandedCard === 'about' && styles.cardExpanded]}
          onPress={() => toggleCard('about')}
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.cardToggle}>
              {expandedCard === 'about' ? '▲' : '▼'}
            </Text>
          </View>
          {expandedCard === 'about' && (
            <Text style={styles.cardBody}>{merchant.description}</Text>
          )}
          {expandedCard !== 'about' && (
            <Text style={styles.cardPreview} numberOfLines={1}>
              {merchant.description}
            </Text>
          )}
        </TouchableOpacity>

        {/* Earn Rate - expandable */}
        <TouchableOpacity
          style={[styles.card, expandedCard === 'earn' && styles.cardExpanded]}
          onPress={() => toggleCard('earn')}
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Earn Rate</Text>
            <Text style={styles.earnBadge}>{merchant.earnRate} EP/AED</Text>
          </View>
          {expandedCard === 'earn' && (
            <View style={styles.earnExamples}>
              <Text style={styles.earnExampleTitle}>Examples:</Text>
              {[10, 25, 50, 100].map(amount => (
                <View key={amount} style={styles.earnRow}>
                  <Text style={styles.earnLeft}>Spend {amount} AED</Text>
                  <Text style={styles.earnRight}>
                    = {amount * merchant.earnRate} EP
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Redemption Status - expandable */}
        <TouchableOpacity
          style={[
            styles.card,
            expandedCard === 'redeem' && styles.cardExpanded,
          ]}
          onPress={() => toggleCard('redeem')}
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Redemption</Text>
            <Text
              style={[
                styles.statusBadge,
                {
                  color: merchant.redemptionEnabled
                    ? COLORS.success
                    : COLORS.error,
                  backgroundColor: merchant.redemptionEnabled
                    ? COLORS.success + '12'
                    : COLORS.error + '12',
                },
              ]}>
              {merchant.redemptionEnabled ? '✓ Available' : '✗ Disabled'}
            </Text>
          </View>
          {expandedCard === 'redeem' && (
            <View style={{marginTop: SPACING.sm}}>
              <Text style={styles.cardBody}>
                {merchant.redemptionEnabled
                  ? 'You can spend your EasyPoints here! Tap "Redeem Points" below to generate a code.'
                  : 'This merchant does not currently accept EasyPoints redemption. You can still earn points here.'}
              </Text>
              {merchant.crossSmeRedemption && (
                <View style={styles.crossSmeBadge}>
                  <Text style={styles.crossSmeText}>
                    🔗 Accepts points earned at other merchants
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Your Balance Context */}
        <View style={styles.balanceContext}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceValue}>
            {easyPointsBalance.toLocaleString()} EP
          </Text>
        </View>

        {/* Show My Code */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.earnBtn}
            onPress={handleEarnQr}
            activeOpacity={0.7}>
            <Text style={styles.earnBtnIcon}>📱</Text>
            <View style={styles.earnBtnContent}>
              <Text style={styles.earnBtnTitle}>Show My Code</Text>
              <Text style={styles.earnBtnDesc}>
                Present your QR code to staff to earn or redeem points
              </Text>
            </View>
          </TouchableOpacity>
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
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.text,
  },
  category: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  /* Cards */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardExpanded: {
    borderColor: COLORS.primary + '25',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardToggle: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  cardBody: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  cardPreview: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  /* Earn card */
  earnBadge: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.secondary,
    backgroundColor: COLORS.secondary + '12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  earnExamples: {
    marginTop: SPACING.sm,
  },
  earnExampleTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  earnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border || '#F0F0F0',
  },
  earnLeft: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  earnRight: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  /* Status */
  statusBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  crossSmeBadge: {
    backgroundColor: COLORS.secondary + '10',
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  crossSmeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  /* Balance */
  balanceContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '08',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.primary,
  },

  /* Action buttons */
  actions: {
    gap: SPACING.sm,
  },
  earnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '12',
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  earnBtnIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  earnBtnContent: {
    flex: 1,
  },
  earnBtnTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  earnBtnDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: SPACING.md,
  },
  redeemBtnIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  redeemBtnContent: {
    flex: 1,
  },
  redeemBtnTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  redeemBtnDesc: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  redeemBtnDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  crossExplainer: {
    backgroundColor: COLORS.secondary + '06',
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary + '25',
  },
  crossExplainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  crossExplainerIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  crossExplainerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  crossExplainerBody: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  crossExplainerBadge: {
    backgroundColor: COLORS.success + '12',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  crossExplainerBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.success,
  },
});
