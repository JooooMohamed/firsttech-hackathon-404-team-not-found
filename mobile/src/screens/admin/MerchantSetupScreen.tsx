import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { merchantSetupSchema, MerchantSetupFormData } from "../../schemas";
import { useMerchantStore } from "../../stores";
import { Button, TextInput } from "../../components";
import { COLORS, SPACING, FONT_SIZE } from "../../constants";

export const MerchantSetupScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { merchantId } = route.params || {};
  const { merchants, createMerchant, updateMerchant } = useMerchantStore();
  const [loading, setLoading] = useState(false);

  const existing = merchants.find((m) => m._id === merchantId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MerchantSetupFormData>({
    resolver: zodResolver(merchantSetupSchema),
    defaultValues: {
      name: existing?.name || "",
      logo: existing?.logo || "",
      category: existing?.category || "",
      description: existing?.description || "",
      earnRate: existing?.earnRate || 10,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        logo: existing.logo,
        category: existing.category,
        description: existing.description,
        earnRate: existing.earnRate,
      });
    }
  }, [existing]);

  const onSubmit = async (data: MerchantSetupFormData) => {
    setLoading(true);
    try {
      if (merchantId) {
        await updateMerchant(merchantId, data);
        Alert.alert("Success", "Merchant updated");
      } else {
        await createMerchant(data);
        Alert.alert("Success", "Merchant created");
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {merchantId ? "Edit Merchant" : "Create Merchant"}
        </Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Merchant Name"
              placeholder="e.g. Café Beirut"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="logo"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Logo Emoji"
              placeholder="e.g. ☕"
              value={value || ""}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Category"
              placeholder="e.g. Food & Beverage"
              value={value || ""}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Description"
              placeholder="Tell customers about your business"
              value={value || ""}
              onChangeText={onChange}
              multiline
            />
          )}
        />

        <Controller
          control={control}
          name="earnRate"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Earn Rate (EP per 1 AED)"
              placeholder="e.g. 10"
              value={String(value)}
              onChangeText={(t) => onChange(parseInt(t) || 0)}
              keyboardType="number-pad"
              error={errors.earnRate?.message}
            />
          )}
        />

        <Button
          title={merchantId ? "Save Changes" : "Create Merchant"}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginTop: SPACING.md }}
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
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
});
