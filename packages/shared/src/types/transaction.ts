import { Merchant } from "./merchant";

export interface Transaction {
  _id: string;
  userId: string;
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

export interface MerchantStats {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalTransactions: number;
  activeMembers: number;
}

export interface DailyStat {
  date: string;
  earned: number;
  redeemed: number;
  txCount: number;
}

export interface EarnResponse {
  transaction: Transaction;
  pointsEarned: number;
  bonusPoints?: number;
  tierBonus?: number;
  tierMultiplier?: number;
  tierUpgrade?: string;
  totalPoints: number;
  amountAed: number;
  earnRate: number;
  appliedOffers?: string[];
  offerMultiplier?: number;
  dualEarn?: { programName: string; partnerPoints: number; currency: string };
}

export interface RedeemResponse {
  transaction: Transaction;
  pointsRedeemed: number;
}
