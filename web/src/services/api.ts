import axios from "axios";
import type {
  AuthResponse,
  User,
  Merchant,
  Transaction,
  EarnResponse,
  RedeemResponse,
  MerchantStats,
  DailyStat,
  Offer,
  QrSession,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://firsttech-hackathon-404-team-not-fo.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Token management ─────────────────────────────────
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && authToken) {
      setAuthToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("easypoints-auth");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => api.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  login: (email: string, password: string) =>
    api
      .post<AuthResponse>("/auth/login", { email, password })
      .then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get<User>("/users/me").then((r) => r.data),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.patch<User>("/users/me", data).then((r) => r.data),
};

// ── Merchants ─────────────────────────────────────────
export const merchantsApi = {
  getAll: () => api.get<Merchant[]>("/merchants").then((r) => r.data),
  getById: (id: string) =>
    api.get<Merchant>(`/merchants/${id}`).then((r) => r.data),
  create: (data: Partial<Merchant>) =>
    api.post<Merchant>("/merchants", data).then((r) => r.data),
  update: (id: string, data: Partial<Merchant>) =>
    api.patch<Merchant>(`/merchants/${id}`, data).then((r) => r.data),
  register: (data: Partial<Merchant>) =>
    api
      .post<{ merchant: Merchant; user: User }>("/merchants/register", data)
      .then((r) => r.data),
  getStaff: (merchantId: string) =>
    api.get<User[]>(`/merchants/${merchantId}/staff`).then((r) => r.data),
  addStaff: (merchantId: string, email: string) =>
    api
      .post<User>(`/merchants/${merchantId}/staff`, { email })
      .then((r) => r.data),
  removeStaff: (merchantId: string, userId: string) =>
    api.delete(`/merchants/${merchantId}/staff/${userId}`).then((r) => r.data),
};

// ── Transactions ──────────────────────────────────────
export const transactionsApi = {
  earn: (data: {
    merchantId: string;
    userId: string;
    amountAed: number;
    qrToken?: string;
    idempotencyKey?: string;
  }) => api.post<EarnResponse>("/transactions/earn", data).then((r) => r.data),

  redeem: (data: {
    merchantId: string;
    userId: string;
    points: number;
    qrToken?: string;
    idempotencyKey?: string;
  }) =>
    api.post<RedeemResponse>("/transactions/redeem", data).then((r) => r.data),

  getMerchantTransactions: (
    merchantId: string,
    params?: { startDate?: string; endDate?: string },
  ) =>
    api
      .get<{
        items: Transaction[];
        nextCursor: string | null;
        hasMore: boolean;
      }>(`/transactions/merchant/${merchantId}`, { params })
      .then((r) => r.data),

  getMerchantStats: (merchantId: string) =>
    api
      .get<MerchantStats>(`/transactions/merchant/${merchantId}/stats`)
      .then((r) => r.data),

  getDailyStats: (merchantId: string) =>
    api
      .get<DailyStat[]>(`/transactions/merchant/${merchantId}/stats/daily`)
      .then((r) => r.data),

  exportMerchantCsv: (merchantId: string) =>
    api
      .get<string>(`/transactions/merchant/${merchantId}/export/csv`, {
        responseType: "text",
      })
      .then((r) => r.data),

  voidTransaction: (transactionId: string, reason?: string) =>
    api
      .post(`/transactions/${transactionId}/void`, { reason })
      .then((r) => r.data),
};

// ── QR Sessions ───────────────────────────────────────
export const qrApi = {
  create: (data: {
    type?: "earn" | "redeem" | "general";
    merchantId?: string;
    amount?: number;
  }) => api.post<QrSession>("/qr/create", data).then((r) => r.data),
  lookup: (token: string) =>
    api.get<QrSession>(`/qr/${token}`).then((r) => r.data),
};

// ── Offers ────────────────────────────────────────────
export const offersApi = {
  getByMerchant: (merchantId: string) =>
    api.get<Offer[]>(`/offers/merchant/${merchantId}`).then((r) => r.data),
  create: (data: Partial<Offer>) =>
    api.post<Offer>("/offers", data).then((r) => r.data),
  update: (id: string, data: Partial<Offer>) =>
    api.patch<Offer>(`/offers/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/offers/${id}`).then((r) => r.data),
};

export default api;
