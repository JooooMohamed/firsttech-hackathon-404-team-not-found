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

export interface ProgramCatalogEntry {
  _id: string;
  name: string;
  logo: string;
  currency: string;
  tiers: string[];
  aedRate: number;
  brandColor: string;
}
