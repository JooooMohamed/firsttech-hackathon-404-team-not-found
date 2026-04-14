export type ActiveRole = 'member' | 'staff' | 'admin' | 'merchant';

export type MerchantStatus = 'ACTIVE' | 'PAUSED' | 'ONBOARDING';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roles: ActiveRole[];
  merchantId: string | null;
  consentGiven: boolean;
  consentGivenAt?: string | null;
  referralCode?: string;
  tier?: string;
  lifetimeEP?: number;
  createdAt: string;
}
