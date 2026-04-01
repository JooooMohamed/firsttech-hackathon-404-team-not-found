import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import { useMerchantStore } from "../../stores";
import { Button } from "../../components";
import { COLORS, SPACING, FONT_SIZE } from "../../constants";

export const MerchantSettingsScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const { merchantId } = route.params;
  const { merchants, updateMerchant } = useMerchantStore();
  const merchant = merchants.find((m) => m._id === merchantId);

  const [redemptionEnabled, setRedemptionEnabled] = useState(
    merchant?.redemptionEnabled ?? true,
  );
  const [crossSme, setCrossSme] = useState(
    merchant?.crossSmeRedemption ?? false,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (merchant) {
      setRedemptionEnabled(merchant.redemptionEnabled);
      setCrossSme(merchant.crossSmeRedemption);
    }
  }, [merchant]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMerchant(merchantId, {
        redemptionEnabled,
        crossSmeRedemption: crossSme,
      });
      Alert.alert("Saved", "Settings updated successfully");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Merchant Settings</Text>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Redemption Enabled</Text>
            <Text style={styles.settingDesc}>
              Allow members to redeem EasyPoints at your store
            </Text>
          </View>
          <Switch
            value={redemptionEnabled}
            onValueChange={setRedemptionEnabled}
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <View style={styles.setting}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Cross-SME Redemption</Text>
            <Text style={styles.settingDesc}>
              Allow points earned elsewhere to be redeemed here (demo toggle)
            </Text>
          </View>
          <Switch
            value={crossSme}
            onValueChange={setCrossSme}
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        <Button
          title="Save Settings"
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: SPACING.xl }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
