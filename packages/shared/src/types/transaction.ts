import { Merchant } from './merchant';

export interface Transaction {
  _id: string;
  userId: string;
  merchantId: string | Merchant;
  type: 'earn' | 'redeem';
  points: number;
  amountAed: number | null;
  reference: string | null;
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
  totalPoints: number;
  amountAed: number;
  earnRate: number;
  appliedOffers?: string[];
  offerMultiplier?: number;
}

export interface RedeemResponse {
  transaction: Transaction;
  pointsRedeemed: number;
}
