"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { merchantsApi } from "@/services/api";
import type { Merchant } from "@/types";

export default function StaffSettingsPage() {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (merchantId) {
      merchantsApi.getById(merchantId).then(setMerchant);
    }
  }, [merchantId]);

  const toggle = async (field: "redemptionEnabled" | "crossSmeRedemption") => {
    if (!merchant) return;
    setSaving(true);
    setMsg("");
    try {
      const updated = await merchantsApi.update(merchant._id, {
        [field]: !merchant[field],
      });
      setMerchant(updated);
      setMsg("Saved");
    } catch {
      setMsg("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (!merchant) {
    return <div className="p-8 text-gray-400">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Merchant Settings</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Redemption Enabled</p>
            <p className="text-xs text-gray-500">
              Allow members to redeem points here
            </p>
          </div>
          <button
            onClick={() => toggle("redemptionEnabled")}
            disabled={saving}
            className={`w-12 h-6 rounded-full transition-colors ${
              merchant.redemptionEnabled ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                merchant.redemptionEnabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Cross-SME Redemption</p>
            <p className="text-xs text-gray-500">
              Allow redeeming points earned at other merchants
            </p>
          </div>
          <button
            onClick={() => toggle("crossSmeRedemption")}
            disabled={saving}
            className={`w-12 h-6 rounded-full transition-colors ${
              merchant.crossSmeRedemption ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                merchant.crossSmeRedemption
                  ? "translate-x-6"
                  : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {msg && (
          <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
