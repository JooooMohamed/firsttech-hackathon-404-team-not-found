"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  merchantSetupSchema,
  type MerchantSetupFormData,
} from "@/schemas/merchant.schema";
import { useAuthStore } from "@/stores/authStore";
import { merchantsApi } from "@/services/api";
import type { Merchant } from "@/types";

export default function MerchantSettingsPage() {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MerchantSetupFormData>({
    resolver: zodResolver(merchantSetupSchema),
  });

  useEffect(() => {
    if (!merchantId) return;
    merchantsApi.getById(merchantId).then((m) => {
      setMerchant(m);
      reset({
        name: m.name,
        logo: m.logo,
        category: m.category,
        description: m.description,
        earnRate: m.earnRate,
        minSpend: m.minSpend,
        bonusMultiplier: m.bonusMultiplier,
        redemptionEnabled: m.redemptionEnabled,
        crossSmeRedemption: m.crossSmeRedemption,
      });
    });
  }, [merchantId, reset]);

  const onSubmit = async (data: MerchantSetupFormData) => {
    if (!merchantId) return;
    setSaving(true);
    setMsg("");
    try {
      const updated = await merchantsApi.update(merchantId, data);
      setMerchant(updated);
      setMsg("Settings saved");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (!merchant) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Merchant Settings</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            {...register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (emoji)
            </label>
            <input
              {...register("logo")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              {...register("category")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Earn Rate
            </label>
            <input
              {...register("earnRate", { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Spend
            </label>
            <input
              {...register("minSpend", { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus ×
            </label>
            <input
              {...register("bonusMultiplier", { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              {...register("redemptionEnabled")}
              type="checkbox"
              className="rounded border-gray-300"
            />
            Redemption Enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              {...register("crossSmeRedemption")}
              type="checkbox"
              className="rounded border-gray-300"
            />
            Cross-SME Redemption
          </label>
        </div>

        {msg && (
          <p
            className={`text-sm px-3 py-2 rounded-lg ${msg.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
          >
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
