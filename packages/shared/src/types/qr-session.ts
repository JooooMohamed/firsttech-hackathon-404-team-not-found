import { User } from './user';
import { Merchant } from './merchant';

export interface QrSession {
  _id: string;
  type: 'earn' | 'redeem' | 'general';
  userId: string | User;
  merchantId: string | Merchant | null;
  token: string;
  amount: number | null;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: string;
  createdAt: string;
  easyPointsBalance?: number;
}
