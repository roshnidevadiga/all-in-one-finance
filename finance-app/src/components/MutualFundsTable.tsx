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
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Rank
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Fund Name
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              AUM (Cr)
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              Expense Ratio (%)
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              Tracking Error (%)
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              3Y CAGR (%)
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              Expense Rank
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              Tracking Rank
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
              Weighted Score
            </th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund, index) => (
            <tr
              key={index}
              className={
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-gray-900"
                  : "bg-white dark:bg-gray-800"
              }
            >
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {fund.rank}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                {fund.fundName}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                ₹{fund.aum.toLocaleString()}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                {fund.expenseRatio}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                {fund.trackingError}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-green-600">
                {fund.cagr3y}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                {fund.expenseRatioRank}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                {fund.trackingErrorRank}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">
                {fund.weightedScore.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
