import React from "react";
import type { MutualFund } from "@/types/mutualFunds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MutualFundCardProps {
  fund: MutualFund;
  isTopRecommendation?: boolean;
}

export const MutualFundCard: React.FC<MutualFundCardProps> = ({
  fund,
  isTopRecommendation = false,
}) => {
  return (
    <Card className={isTopRecommendation ? "border-primary shadow-lg" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{fund.fundName}</span>
          <div className="flex gap-2">
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
              Rank #{fund.rank}
            </span>
            {isTopRecommendation && (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                Top Pick
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">AUM:</span>
              <span className="font-medium">
                ₹{fund.aum.toLocaleString()} Cr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expense Ratio:
              </span>
              <span className="font-medium">{fund.expenseRatio}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Tracking Error:
              </span>
              <span className="font-medium">{fund.trackingError}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">3Y CAGR:</span>
              <span className="font-medium text-green-600">{fund.cagr3y}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expense Rank:
              </span>
              <span className="font-medium">#{fund.expenseRatioRank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Tracking Rank:
              </span>
              <span className="font-medium">#{fund.trackingErrorRank}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
