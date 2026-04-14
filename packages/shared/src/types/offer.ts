import { Merchant } from './merchant';

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
