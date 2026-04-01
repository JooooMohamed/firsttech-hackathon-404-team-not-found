// ── User ──────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roles: ('member' | 'staff' | 'admin')[];
  merchantId: string | null;
  consentGiven: boolean;
  referralCode?: string;
  createdAt: string;
}

export type ActiveRole = 'member' | 'staff' | 'admin';

// ── Merchant ──────────────────────────────────────────
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
  ownerId: string;
  createdAt: string;
}

// ── Wallet ────────────────────────────────────────────
export interface Wallet {
  _id: string;
  userId: string;
  merchantId: string | null;
  balance: number;
  updatedAt: string;
}

// ── Transaction ───────────────────────────────────────
export interface Transaction {
  _id: string;
  userId: string;
  merchantId: string | Merchant; // populated or just id
  type: 'earn' | 'redeem';
  points: number;
  amountAed: number | null;
  reference: string | null;
  createdAt: string;
}

// ── Linked Program ──────────────────────────────────────
export interface LinkedProgram {
  _id: string;
  userId: string;
  programName: string;
  programLogo: string;
  balance: number;
  tier: string;
  currency: string;
  aedRate: number;
  brandColor: string;
}

// ── Program Catalog Entry ──────────────────────────────
export interface ProgramCatalogEntry {
  _id: string;
  name: string;
  logo: string;
  currency: string;
  tiers: string[];
  aedRate: number;
  brandColor: string;
}

// ── QR Session ────────────────────────────────────────
export interface QrSession {
  _id: string;
  type: 'earn' | 'redeem';
  userId: string | User;
  merchantId: string | Merchant;
  token: string;
  amount: number | null;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: string;
  createdAt: string;
}

// ── API Response ──────────────────────────────────────
export interface AuthResponse {
  token: string;
  user: User;
}

export interface EarnResponse {
  transaction: Transaction;
  pointsEarned: number;
  amountAed: number;
  earnRate: number;
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

// ── Offer ─────────────────────────────────────────────
export interface Offer {
  _id: string;
  merchantId: string | Merchant;
  title: string;
  description: string;
  type: 'bonus' | 'discount' | 'freebie';
  value: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
}

// ── Daily Stats ───────────────────────────────────────
export interface DailyStat {
  date: string;
  earned: number;
  redeemed: number;
  txCount: number;
}

// ── Notification ──────────────────────────────────────
export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}
