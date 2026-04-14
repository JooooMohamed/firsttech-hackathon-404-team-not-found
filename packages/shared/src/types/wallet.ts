export interface Wallet {
  _id: string;
  userId: string;
  merchantId: string | null;
  balance: number;
  updatedAt: string;
}
