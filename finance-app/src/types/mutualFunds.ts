export interface MutualFund {
  fundName: string;
  aum: number;
  expenseRatio: number;
  trackingError: number;
  cagr3y: number;
  rank: number;
  expenseRatioRank: number;
  trackingErrorRank: number;
  weightedScore: number;
}

export interface MutualFundData {
  timestamp: string;
  methodology: {
    expenseRatioWeight: string;
    trackingErrorWeight: string;
    description: string;
  };
  totalFunds: number;
  topRecommendation: MutualFund;
  allRankings: MutualFund[];
}

export type FundType = "index" | "equity" | "debt" | "hybrid" | "midcap" | "smallcap";

export interface FundTypeOption {
  value: FundType;
  label: string;
  description: string;
  dataRefreshDate: string;
  comingSoon?: boolean;
} 