"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  earnSchema,
  redeemSchema,
  type EarnFormData,
  type RedeemFormData,
} from "@/schemas/transaction.schema";
import { transactionsApi, qrApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { EarnResponse, RedeemResponse } from "@/types";
import { CheckCircle } from "lucide-react";

export default function StaffTransactionPage() {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [mode, setMode] = useState<"earn" | "redeem">("earn");
  const [step, setStep] = useState<"form" | "result">("form");
  const [qrToken, setQrToken] = useState("");
  const [memberId, setMemberId] = useState("");
  const [result, setResult] = useState<EarnResponse | RedeemResponse | null>(
    null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const earnForm = useForm<EarnFormData>({
    resolver: zodResolver(earnSchema),
    defaultValues: { amountAed: 0 },
  });
  const redeemForm = useForm<RedeemFormData>({
    resolver: zodResolver(redeemSchema),
    defaultValues: { points: 0 },
  });

  // Lookup QR to get member ID
  const handleQrLookup = async () => {
    if (!qrToken) return;
    try {
      const session = await qrApi.lookup(qrToken.toUpperCase());
      const uid =
        typeof session.userId === "object"
          ? session.userId._id
          : session.userId;
      setMemberId(uid);
      setError("");
    } catch {
      setError("Invalid or expired QR code");
    }
  };

  const handleEarn = async (data: EarnFormData) => {
    if (!merchantId || !memberId) {
      setError("Enter a member QR or ID first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await transactionsApi.earn({
        merchantId,
        userId: memberId,
        amountAed: data.amountAed,
        qrToken: qrToken || undefined,
      });
      setResult(res);
      setStep("result");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Earn failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (data: RedeemFormData) => {
    if (!merchantId || !memberId) {
      setError("Enter a member QR or ID first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await transactionsApi.redeem({
        merchantId,
        userId: memberId,
        points: data.points,
        qrToken: qrToken || undefined,
      });
      setResult(res);
      setStep("result");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Redeem failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("form");
    setResult(null);
    setQrToken("");
    setMemberId("");
    setError("");
    earnForm.reset();
    redeemForm.reset();
  };

  if (step === "result" && result) {
    const isEarn = "pointsEarned" in result;
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm w-full">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {isEarn ? "Points Earned!" : "Points Redeemed!"}
          </h3>
          <p className="text-3xl font-bold text-primary mb-1">
            {isEarn
              ? `+${(result as EarnResponse).totalPoints || (result as EarnResponse).pointsEarned}`
              : `-${(result as RedeemResponse).pointsRedeemed}`}{" "}
            EP
          </p>
          {isEarn && (result as EarnResponse).amountAed && (
            <p className="text-gray-500 text-sm">
              for {(result as EarnResponse).amountAed} AED
            </p>
          )}
          {isEarn && (result as EarnResponse).appliedOffers && (
            <p className="text-xs text-green-600 mt-2">
              Bonus: {(result as EarnResponse).appliedOffers!.join(", ")}
            </p>
          )}
          <button
            onClick={reset}
            className="mt-6 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            New Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">New Transaction</h2>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        {(["earn", "redeem"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              mode === m ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Member lookup */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Member QR Code
        </label>
        <div className="flex gap-2">
          <input
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            placeholder="Scan or enter QR code"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleQrLookup}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            Lookup
          </button>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Or enter Member ID directly
          </label>
          <input
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Member ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        {memberId && (
          <p className="text-xs text-green-600">Member: {memberId}</p>
        )}
      </div>

      {/* Earn / Redeem form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {mode === "earn" ? (
          <form
            onSubmit={earnForm.handleSubmit(handleEarn)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (AED)
              </label>
              <input
                {...earnForm.register("amountAed", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="100"
              />
              {earnForm.formState.errors.amountAed && (
                <p className="text-xs text-red-500 mt-1">
                  {earnForm.formState.errors.amountAed.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Processing…" : "Earn Points"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={redeemForm.handleSubmit(handleRedeem)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points to Redeem
              </label>
              <input
                {...redeemForm.register("points", { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="50"
              />
              {redeemForm.formState.errors.points && (
                <p className="text-xs text-red-500 mt-1">
                  {redeemForm.formState.errors.points.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Processing…" : "Redeem Points"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
