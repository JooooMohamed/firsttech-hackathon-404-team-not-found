export interface EarnBody {
  merchantId: string;
  userId: string;
  amountAed: number;
  qrToken?: string;
  idempotencyKey?: string;
}

export interface RedeemBody {
  merchantId: string;
  userId: string;
  points: number;
  qrToken?: string;
  idempotencyKey?: string;
}

export interface TransactionQueryParams {
  cursor?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}

export interface MerchantQueryParams {
  cursor?: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}
