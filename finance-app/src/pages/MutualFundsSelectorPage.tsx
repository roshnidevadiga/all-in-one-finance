import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  FundType,
  FundTypeOption,
  MutualFundData,
} from "@/types/mutualFunds";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MutualFundCard } from "@/components/MutualFundCard";
import { MutualFundsTable } from "@/components/MutualFundsTable";
import { ArrowLeft, ChevronDown, Info } from "lucide-react";
import mutualFundsData from "@/data/ranked_index_mutual_funds.json";

const fundTypeOptions: FundTypeOption[] = [
  {
    value: "index",
    label: "Index Funds",
    description: "Passive funds that track market indices",
    dataRefreshDate: "8th June 2025",
  },
];

export const MutualFundsSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFundType, setSelectedFundType] = useState<FundType | null>(
    null
  );
  const [showFullTable, setShowFullTable] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const typedMutualFundsData = mutualFundsData as MutualFundData;

  const handleFundTypeSelect = (fundType: FundType) => {
    setSelectedFundType(fundType);
    setDropdownOpen(false);
    setShowFullTable(false);
  };

  const selectedOption = fundTypeOptions.find(
    (option) => option.value === selectedFundType
  );
  const topFiveFunds =
    selectedFundType === "index"
      ? typedMutualFundsData.allRankings.slice(0, 5)
      : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void navigate("/");
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Mutual Funds Selector</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Fund Type Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Fund Type</CardTitle>
            <CardDescription>
              Choose the type of mutual fund you want to explore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                {selectedFundType
                  ? fundTypeOptions.find(
                      (opt) => opt.value === selectedFundType
                    )?.label
                  : "Select a fund type..."}
                <ChevronDown className="h-4 w-4" />
              </Button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  {fundTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
                      onClick={() => handleFundTypeSelect(option.value)}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Refresh Date */}
        {selectedOption && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="h-4 w-4" />
            <span>Data last refreshed: {selectedOption.dataRefreshDate}</span>
          </div>
        )}

        {/* Top 5 Recommendations */}
        {selectedFundType && topFiveFunds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Top 5 Recommended Funds
            </h2>
            <div className="space-y-6">
              {/* Top 3 funds */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topFiveFunds.slice(0, 3).map((fund, index) => (
                  <MutualFundCard
                    key={fund.fundName}
                    fund={fund}
                    isTopRecommendation={index === 0}
                  />
                ))}
              </div>

              {/* Bottom 2 funds - centered */}
              {topFiveFunds.length > 3 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
                  {topFiveFunds.slice(3, 5).map((fund) => (
                    <MutualFundCard
                      key={fund.fundName}
                      fund={fund}
                      isTopRecommendation={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Methodology Information */}
        {selectedFundType === "index" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Ranking Methodology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {typedMutualFundsData.methodology.description}
              </p>
              <div className="mt-2 text-sm">
                <span className="font-medium">Expense Ratio Weight:</span>{" "}
                {typedMutualFundsData.methodology.expenseRatioWeight} |
                <span className="font-medium ml-2">Tracking Error Weight:</span>{" "}
                {typedMutualFundsData.methodology.trackingErrorWeight}
              </div>
            </CardContent>
          </Card>
        )}

        {/* See More / Full Table */}
        {selectedFundType && topFiveFunds.length > 0 && (
          <div className="mb-8">
            {!showFullTable ? (
              <div className="text-center">
                <Button
                  onClick={() => setShowFullTable(true)}
                  variant="outline"
                  size="lg"
                >
                  See All {typedMutualFundsData.totalFunds} Funds
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    All {selectedOption?.label}
                  </h2>
                  <Button
                    onClick={() => setShowFullTable(false)}
                    variant="outline"
                    size="sm"
                  >
                    Show Less
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <MutualFundsTable
                      funds={typedMutualFundsData.allRankings}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* No selection state */}
        {!selectedFundType && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-medium mb-2">
                Select a fund type to get started
              </h3>
              <p className="text-sm">
                Choose from the dropdown above to see our top recommendations
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
