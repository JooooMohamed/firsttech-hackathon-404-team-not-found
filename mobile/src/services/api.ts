import axios from 'axios';
import {API_BASE_URL} from '../constants';
import {
  AuthResponse,
  User,
  Merchant,
  Wallet,
  Transaction,
  LinkedProgram,
  ProgramCatalogEntry,
  QrSession,
  EarnResponse,
  RedeemResponse,
  MerchantStats,
  Offer,
  DailyStat,
} from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
});

// Token interceptor — set from authStore
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// 401 interceptor — auto-logout on expired/invalid token
api.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401 && authToken) {
      // Token expired or invalid — force logout
      setAuthToken(null);
      // Lazy import to avoid circular dependency
      const {useAuthStore} = require('../stores/authStore');
      useAuthStore.getState().logout();
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
    referralCode?: string;
  }) => api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', {email, password}).then(r => r.data),
};

// ── Users ─────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get<User>('/users/me').then(r => r.data),

  updateConsent: (consentGiven: boolean) =>
    api.patch<User>('/users/me/consent', {consentGiven}).then(r => r.data),

  updateProfile: (data: {name?: string; phone?: string}) =>
    api.patch<User>('/users/me', data).then(r => r.data),
};

// ── Programs ──────────────────────────────────────────
export const programsApi = {
  getMyPrograms: () =>
    api.get<LinkedProgram[]>('/programs/my').then(r => r.data),

  getCatalog: () =>
    api.get<ProgramCatalogEntry[]>('/programs/catalog').then(r => r.data),

  getEasyPointsConfig: () =>
    api
      .get<{aedRate: number; brandColor: string}>('/programs/easypoints-config')
      .then(r => r.data),

  getAvailable: () =>
    api
      .get<
        {
          programName: string;
          programLogo: string;
          currency: string;
          aedRate: number;
          brandColor: string;
        }[]
      >('/programs/available')
      .then(r => r.data),

  link: (programName: string) =>
    api.post<LinkedProgram>('/programs/link', {programName}).then(r => r.data),

  unlink: (programId: string) =>
    api.delete(`/programs/${programId}`).then(r => r.data),
};

// ── Merchants ─────────────────────────────────────────
export const merchantsApi = {
  getAll: () => api.get<Merchant[]>('/merchants').then(r => r.data),

  getById: (id: string) =>
    api.get<Merchant>(`/merchants/${id}`).then(r => r.data),

  create: (data: Partial<Merchant>) =>
    api.post<Merchant>('/merchants', data).then(r => r.data),

  update: (id: string, data: Partial<Merchant>) =>
    api.patch<Merchant>(`/merchants/${id}`, data).then(r => r.data),

  getStats: (id: string) =>
    api
      .get<MerchantStats>(`/transactions/merchant/${id}/stats`)
      .then(r => r.data),

  // C1: Self-service onboarding
  register: (data: Partial<Merchant>) =>
    api
      .post<{merchant: Merchant; user: User}>('/merchants/register', data)
      .then(r => r.data),

  // I4: Staff management
  getStaff: (merchantId: string) =>
    api.get<User[]>(`/merchants/${merchantId}/staff`).then(r => r.data),

  addStaff: (merchantId: string, email: string) =>
    api.post<User>(`/merchants/${merchantId}/staff`, {email}).then(r => r.data),

  removeStaff: (merchantId: string, userId: string) =>
    api.delete(`/merchants/${merchantId}/staff/${userId}`).then(r => r.data),
};

// ── Wallets ───────────────────────────────────────────
export const walletsApi = {
  getMyWallets: () => api.get<Wallet[]>('/wallets/my').then(r => r.data),

  getForMerchant: (merchantId: string) =>
    api.get<Wallet>(`/wallets/my/${merchantId}`).then(r => r.data),
};

// ── Transactions ──────────────────────────────────────
export const transactionsApi = {
  earn: (data: {
    merchantId: string;
    userId: string;
    amountAed: number;
    qrToken?: string;
  }) => api.post<EarnResponse>('/transactions/earn', data).then(r => r.data),

  redeem: (data: {
    merchantId: string;
    userId: string;
    points: number;
    qrToken?: string;
  }) =>
    api.post<RedeemResponse>('/transactions/redeem', data).then(r => r.data),

  getMyTransactions: (params?: {startDate?: string; endDate?: string}) =>
    api.get<Transaction[]>('/transactions/my', {params}).then(r => r.data),

  getMyInsights: () =>
    api
      .get<{
        earned: number;
        redeemed: number;
        txCount: number;
        topMerchant: {name: string; logo: string; points: number} | null;
      }>('/transactions/my/insights')
      .then(r => r.data),

  getMerchantTransactions: (merchantId: string) =>
    api
      .get<Transaction[]>(`/transactions/merchant/${merchantId}`)
      .then(r => r.data),

  getDailyStats: (merchantId: string) =>
    api
      .get<DailyStat[]>(`/transactions/merchant/${merchantId}/stats/daily`)
      .then(r => r.data),

  exportMyCsv: () =>
    api
      .get<string>('/transactions/my/export/csv', {
        responseType: 'text',
      })
      .then(r => r.data),

  exportMerchantCsv: (merchantId: string) =>
    api
      .get<string>(`/transactions/merchant/${merchantId}/export/csv`, {
        responseType: 'text',
      })
      .then(r => r.data),
};

// ── QR Sessions ───────────────────────────────────────
export const qrApi = {
  create: (data: {
    type?: 'earn' | 'redeem' | 'general';
    merchantId?: string;
    amount?: number;
  }) => api.post<QrSession>('/qr/create', data).then(r => r.data),

  lookup: (token: string) =>
    api.get<QrSession>(`/qr/${token}`).then(r => r.data),

  complete: (token: string) =>
    api.patch<QrSession>(`/qr/${token}/complete`).then(r => r.data),
};

export default api;

// ── Offers ─────────────────────────────────────────────
export const offersApi = {
  getActive: () => api.get<Offer[]>('/offers/active').then(r => r.data),

  getByMerchant: (merchantId: string) =>
    api.get<Offer[]>(`/offers/merchant/${merchantId}`).then(r => r.data),

  getActiveByMerchant: (merchantId: string) =>
    api.get<Offer[]>(`/offers/merchant/${merchantId}/active`).then(r => r.data),

  create: (data: Partial<Offer>) =>
    api.post<Offer>('/offers', data).then(r => r.data),

  update: (id: string, data: Partial<Offer>) =>
    api.patch<Offer>(`/offers/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/offers/${id}`).then(r => r.data),
};
