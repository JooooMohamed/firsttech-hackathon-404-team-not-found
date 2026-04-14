import { MerchantStatus } from './user';

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
  status: MerchantStatus;
  ownerId: string;
  createdAt: string;
}
