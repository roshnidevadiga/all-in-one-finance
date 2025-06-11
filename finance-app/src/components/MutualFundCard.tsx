import React from "react";
import type { MutualFund } from "@/types/mutualFunds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award } from "lucide-react";

interface MutualFundCardProps {
  fund: MutualFund;
  isTopRecommendation?: boolean;
}

export const MutualFundCard: React.FC<MutualFundCardProps> = ({
  fund,
  isTopRecommendation = false,
}) => {
  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-all duration-200 ${
        isTopRecommendation ? "border-primary bg-primary/5" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          {isTopRecommendation && (
            <div className="flex items-center gap-1 text-primary mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs font-medium">Top Pick</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground ml-auto">
            <span className="text-xs font-medium">Rank</span>
            <span
              className={`text-sm font-semibold ${
                isTopRecommendation ? "text-primary" : ""
              }`}
            >
              #{fund.rank}
            </span>
          </div>
        </div>
        <CardTitle className="text-base md:text-lg line-clamp-2">
          {fund.fundName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">AUM</span>
                <span className="text-sm font-medium">
                  ₹{fund.aum.toLocaleString()} Cr
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">
                  Expense Ratio
                </span>
                <span className="text-sm font-medium">
                  {fund.expenseRatio}%
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">
                  Tracking Error
                </span>
                <span className="text-sm font-medium">
                  {fund.trackingError}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">3Y CAGR</span>
                <span className="text-sm font-medium text-green-500">
                  {fund.cagr3y}%
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">
                  Expense Rank
                </span>
                <span className="text-sm font-medium">
                  #{fund.expenseRatioRank}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">
                  Tracking Rank
                </span>
                <span className="text-sm font-medium">
                  #{fund.trackingErrorRank}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Score</span>
            <span className="text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              {fund.weightedScore.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
