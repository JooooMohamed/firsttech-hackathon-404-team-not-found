// Re-export all types from mobile — identical for web
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roles: ("member" | "staff" | "admin" | "merchant")[];
  merchantId: string | null;
  consentGiven: boolean;
  consentGivenAt?: string | null;
  referralCode?: string;
  tier?: string;
  lifetimeEP?: number;
  createdAt: string;
}

export type ActiveRole = "member" | "staff" | "admin" | "merchant";
export type MerchantStatus = "ACTIVE" | "PAUSED" | "ONBOARDING";

export interface Merchant {
  _id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  earnRate: number;
  minSpend: number;
  bonusMultiplier: number;
  redemptionEnabled: boolean;
  crossSmeRedemption: boolean;
  status?: MerchantStatus;
  ownerId: string;
  createdAt: string;
}

export interface Wallet {
  _id: string;
  userId: string;
  merchantId: string | null;
  balance: number;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string | User;
  merchantId: string | Merchant;
  type: "earn" | "redeem";
  points: number;
  amountAed: number | null;
  reference: string | null;
  idempotencyKey?: string | null;
  voidedAt?: string | null;
  voidedBy?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface EarnResponse {
  transaction: Transaction;
  pointsEarned: number;
  bonusPoints?: number;
  totalPoints?: number;
  amountAed: number;
  earnRate: number;
  appliedOffers?: string[];
  offerMultiplier?: number;
  tierBonus?: number;
  tierMultiplier?: number;
  tierUpgrade?: string;
  dualEarn?: { programName: string; partnerPoints: number; currency: string };
}

export interface RedeemResponse {
  transaction: Transaction;
  pointsRedeemed: number;
}

export interface MerchantStats {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalTransactions: number;
  activeMembers: number;
}

export interface Offer {
  _id: string;
  merchantId: string | Merchant;
  title: string;
  description: string;
  type: "bonus" | "discount" | "freebie";
  value: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface DailyStat {
  date: string;
  earned: number;
  redeemed: number;
  txCount: number;
}

export interface QrSession {
  _id: string;
  type: "earn" | "redeem" | "general";
  userId: string | User;
  merchantId: string | Merchant | null;
  token: string;
  amount: number | null;
  status: "pending" | "completed" | "expired";
  expiresAt: string;
  createdAt: string;
  easyPointsBalance?: number;
}
