import React from "react";
import type { MutualFund } from "@/types/mutualFunds";

interface MutualFundsTableProps {
  funds: MutualFund[];
}

export const MutualFundsTable: React.FC<MutualFundsTableProps> = ({
  funds,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-accent/50">
            <th className="border-b border-border px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rank
            </th>
            <th className="border-b border-border px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Fund Name
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              AUM (Cr)
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Expense Ratio (%)
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tracking Error (%)
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              3Y CAGR (%)
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Expense Rank
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tracking Rank
            </th>
            <th className="border-b border-border px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Weighted Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {funds.map((fund, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0
                  ? "bg-background hover:bg-accent/20 transition-colors"
                  : "bg-accent/10 hover:bg-accent/20 transition-colors"
              }
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span
                  className={fund.rank <= 3 ? "text-primary font-semibold" : ""}
                >
                  {fund.rank}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                {fund.fundName}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                ₹{fund.aum.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                {fund.expenseRatio}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                {fund.trackingError}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                <span className="text-green-500 font-medium">
                  {fund.cagr3y}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                {fund.expenseRatioRank}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                {fund.trackingErrorRank}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                {fund.weightedScore.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
