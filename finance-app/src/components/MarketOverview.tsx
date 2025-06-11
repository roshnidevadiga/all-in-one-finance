import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
}

export const MarketOverview: React.FC = () => {
  const stockData: StockData[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      price: 175.43,
      change: 2.15,
      changePercent: 1.24,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      sector: "Technology",
      price: 378.85,
      change: -1.92,
      changePercent: -0.5,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Technology",
      price: 142.87,
      change: 3.21,
      changePercent: 2.3,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      sector: "Automotive",
      price: 248.5,
      change: -5.32,
      changePercent: -2.1,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      sector: "Technology",
      price: 721.33,
      change: 15.67,
      changePercent: 2.22,
    },
    {
      symbol: "META",
      name: "Meta Platforms",
      sector: "Technology",
      price: 486.91,
      change: 0.0,
      changePercent: 0.0,
    },
  ];

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number): string => {
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent: number): string => {
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Market Overview
          </h2>
          <p className="text-lg text-muted-foreground">
            Live market data and real-time insights
          </p>
        </div>

        <Card className="shadow-modern-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Stocks</span>
              <span className="text-sm text-muted-foreground font-normal">
                Updated: {new Date().toLocaleTimeString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-2 font-semibold text-muted-foreground text-sm">
                      STOCK NAME
                    </th>
                    <th className="text-left py-4 px-2 font-semibold text-muted-foreground text-sm">
                      SECTOR
                    </th>
                    <th className="text-right py-4 px-2 font-semibold text-muted-foreground text-sm">
                      PRICE
                    </th>
                    <th className="text-right py-4 px-2 font-semibold text-muted-foreground text-sm">
                      CHANGE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((stock, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {stock.symbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm text-muted-foreground">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="font-semibold">
                          {formatPrice(stock.price)}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div
                          className={`flex items-center justify-end space-x-1 ${getChangeColor(
                            stock.change
                          )}`}
                        >
                          {getChangeIcon(stock.change)}
                          <span className="font-medium">
                            {formatChange(stock.change)}
                          </span>
                          <span className="text-sm">
                            ({formatChangePercent(stock.changePercent)})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
