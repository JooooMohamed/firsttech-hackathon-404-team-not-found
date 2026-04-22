"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { merchantsApi } from "@/services/api";
import type { User } from "@/types";
import { UserPlus, Trash2 } from "lucide-react";

export default function MerchantStaffPage() {
  const { user } = useAuthStore();
  const merchantId = user?.merchantId;

  const [staffList, setStaffList] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchStaff = async () => {
    if (!merchantId) return;
    try {
      const data = await merchantsApi.getStaff(merchantId);
      setStaffList(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [merchantId]);

  const handleAdd = async () => {
    if (!merchantId || !email.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      await merchantsApi.addStaff(merchantId, email.trim());
      setEmail("");
      setMsg("Staff added");
      fetchStaff();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (staffId: string) => {
    if (!merchantId) return;
    try {
      await merchantsApi.removeStaff(merchantId, staffId);
      setStaffList((prev) => prev.filter((s) => s._id !== staffId));
    } catch {
      setMsg("Failed to remove");
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Staff Management</h2>

      {/* Add staff */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Staff by Email
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={loading || !email.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <UserPlus size={16} /> Add
          </button>
        </div>
        {msg && (
          <p
            className={`mt-2 text-sm px-3 py-2 rounded-lg ${msg.includes("Failed") || msg.includes("failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
          >
            {msg}
          </p>
        )}
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {staffList.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            No staff members yet
          </p>
        ) : (
          staffList.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-gray-500">{s.email}</p>
              </div>
              <button
                onClick={() => handleRemove(s._id)}
                className="text-red-400 hover:text-red-600 p-1"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
