"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IncomeSavingsLineChart } from "@/components/charts/income-savings-line-chart";
import { AllocationBarChart } from "@/components/charts/allocation-bar-chart";
import {
  formatCurrency,
  formatPercentage,
  formatMonth,
  getCurrentMonth,
  MIN_SAVINGS_RATE_PERCENT,
} from "@/lib/utils";
import type { InsightsData } from "@/app/actions/insights";
import type { CurrencyCode } from "@/lib/validators";

interface InsightsContentProps {
  data: InsightsData;
  currency: CurrencyCode;
  email: string;
}

export function InsightsContent({
  data,
  currency,
  email,
}: InsightsContentProps) {
  const { year, month } = getCurrentMonth();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  // Reverse and paginate monthly history
  const reversedHistory = [...data.monthlyTrends].reverse();
  const totalPages = Math.ceil(reversedHistory.length / itemsPerPage);
  const paginatedHistory = reversedHistory.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <Header email={email} year={year} month={month} />

      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">
            Insights & Statistics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Overview of your budgeting history across {data.totalMonths} month
            {data.totalMonths !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Average Income
              </p>
              <p className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(data.averageIncome, currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Average Savings Rate
              </p>
              <p className="text-lg sm:text-2xl font-bold text-savings">
                {formatPercentage(data.averageSavingsRate * 100, 1)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Avg Monthly Savings
              </p>
              <p className="text-lg sm:text-2xl font-bold text-savings truncate">
                {formatCurrency(data.averageSavingsAmount, currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Total Saved
              </p>
              <p className="text-lg sm:text-2xl font-bold text-success truncate">
                {formatCurrency(data.totalSaved, currency)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Income vs Savings Trend */}
          <IncomeSavingsLineChart
            data={data.monthlyTrends}
            currency={currency}
          />

          {/* Top Categories */}
          <AllocationBarChart
            data={data.topCategories.map((c) => ({
              name: c.name,
              value: c.total,
              color: c.color,
            }))}
            currency={currency}
          />
        </div>

        {/* Low Savings Months */}
        {data.monthsWithLowSavings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Months with Savings Below {MIN_SAVINGS_RATE_PERCENT}%
                <Badge variant="secondary">
                  {data.monthsWithLowSavings.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.monthsWithLowSavings.map((m) => (
                  <div
                    key={`${m.year}-${m.month}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {formatMonth(m.year, m.month)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Savings rate: {formatPercentage(m.savingsRate * 100, 1)}
                      </p>
                    </div>
                    {m.adjustmentReason && (
                      <div className="sm:text-right max-w-md">
                        <p className="text-xs text-muted-foreground">Reason:</p>
                        <p className="text-sm">{m.adjustmentReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Monthly History</span>
              {totalPages > 1 && (
                <span className="text-sm font-normal text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile: Cards */}
            <div className="sm:hidden space-y-3">
              {paginatedHistory.map((m) => (
                <div
                  key={`mobile-${m.year}-${m.month}`}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatMonth(m.year, m.month)}</p>
                    <span
                      className={`text-sm font-medium ${
                        m.savingsRate < 0.2 ? "text-warning" : "text-savings"
                      }`}
                    >
                      {formatPercentage(m.savingsRate * 100, 0)} saved
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Income</p>
                      <p className="font-medium">{formatCurrency(m.income, currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Savings</p>
                      <p className="font-medium text-savings">{formatCurrency(m.savingsAmount, currency)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs">Total Allocated</p>
                      <p className="font-medium">{formatCurrency(m.totalAllocated, currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Month</th>
                    <th className="text-right py-3 px-2">Income</th>
                    <th className="text-right py-3 px-2">Savings Rate</th>
                    <th className="text-right py-3 px-2">Savings</th>
                    <th className="text-right py-3 px-2">Total Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((m) => (
                    <tr
                      key={`desktop-${m.year}-${m.month}`}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-2 font-medium">
                        {formatMonth(m.year, m.month)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatCurrency(m.income, currency)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={
                            m.savingsRate < 0.2
                              ? "text-warning"
                              : "text-savings"
                          }
                        >
                          {formatPercentage(m.savingsRate * 100, 0)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-savings">
                        {formatCurrency(m.savingsAmount, currency)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatCurrency(m.totalAllocated, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
