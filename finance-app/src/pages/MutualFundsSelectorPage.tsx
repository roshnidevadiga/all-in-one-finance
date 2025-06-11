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
import { ArrowLeft, ChevronDown, Info, TrendingUp } from "lucide-react";
import mutualFundsData from "@/data/ranked_index_mutual_funds.json";
import { Navigation } from "@/components/Navigation";

const fundTypeOptions: FundTypeOption[] = [
  {
    value: "index",
    label: "Index Funds",
    description: "Passive funds that track market indices",
    dataRefreshDate: "8th June 2025",
  },
  {
    value: "midcap",
    label: "Mid Cap Funds",
    description: "Funds investing in mid-sized companies",
    dataRefreshDate: "Coming Soon",
    comingSoon: true,
  },
  {
    value: "smallcap",
    label: "Small Cap Funds",
    description: "Funds investing in small-sized companies",
    dataRefreshDate: "Coming Soon",
    comingSoon: true,
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

  const handleFundTypeSelect = (fundType: FundType, comingSoon?: boolean) => {
    if (comingSoon) {
      // Don't select if it's coming soon
      setDropdownOpen(false);
      return;
    }
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navigation currentPage="tools" />

      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigate("/tools");
                }}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Mutual Funds Selector
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Fund Type Selection */}
        <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Select Fund Type</CardTitle>
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
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border border-border rounded-md shadow-lg">
                  {fundTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`w-full px-4 py-3 text-left hover:bg-accent first:rounded-t-md last:rounded-b-md ${
                        option.comingSoon
                          ? "opacity-60 cursor-not-allowed hover:bg-transparent"
                          : ""
                      }`}
                      onClick={() => {
                        handleFundTypeSelect(option.value, option.comingSoon);
                      }}
                      disabled={option.comingSoon}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{option.label}</div>
                        {option.comingSoon && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
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
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Data last refreshed: {selectedOption.dataRefreshDate}</span>
          </div>
        )}

        {/* Top 5 Recommendations */}
        {selectedFundType && topFiveFunds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-border">
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
          <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-200 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                Ranking Methodology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {typedMutualFundsData.methodology.description}
              </p>
              <div className="mt-3 p-3 bg-background rounded-md border border-border text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      Expense Ratio Weight:
                    </span>
                    <span className="text-primary font-semibold">
                      {typedMutualFundsData.methodology.expenseRatioWeight}
                    </span>
                  </div>
                  <div className="hidden sm:block text-muted-foreground">|</div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      Tracking Error Weight:
                    </span>
                    <span className="text-primary font-semibold">
                      {typedMutualFundsData.methodology.trackingErrorWeight}
                    </span>
                  </div>
                </div>
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
                  onClick={() => {
                    setShowFullTable(true);
                  }}
                  variant="outline"
                  size="lg"
                  className="group"
                >
                  See All {typedMutualFundsData.totalFunds} Funds
                  <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h2 className="text-xl font-semibold">
                    All {selectedOption?.label}
                  </h2>
                  <Button
                    onClick={() => {
                      setShowFullTable(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Show Less
                  </Button>
                </div>
                <Card className="shadow-sm">
                  <CardContent className="p-0 overflow-hidden">
                    <MutualFundsTable
                      funds={typedMutualFundsData.allRankings}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedFundType && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Select a fund type to get started
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Choose from the dropdown above to see our top recommendations
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-sm text-muted-foreground">
                © 2025 All In One Finance. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Privacy
              </button>
              <button className="hover:text-foreground transition-colors">
                Terms
              </button>
              <button className="hover:text-foreground transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
