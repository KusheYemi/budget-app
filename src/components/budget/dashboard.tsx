"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { SummaryCard } from "./summary-card";
import { CategoryList } from "./category-list";
import { EditIncomeDialog } from "./edit-income-dialog";
import { SavingsRateDialog } from "./savings-rate-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationPieChart } from "@/components/charts/allocation-pie-chart";
import { AllocationBarChart } from "@/components/charts/allocation-bar-chart";
import { toast } from "sonner";
import {
  getCurrentMonth,
  isCurrentMonth,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils";
import { getBudgetMonth } from "@/app/actions/budget";
import { getCategories } from "@/app/actions/categories";
import { getUserProfile } from "@/app/actions/auth";
import { copyAllocationsFromPreviousMonthForBudget } from "@/app/actions/allocations";
import type { CurrencyCode } from "@/lib/validators";
import type { Category, Allocation, BudgetMonth } from "@prisma/client";

interface AllocationWithCategory extends Allocation {
  category: Category;
}

interface BudgetMonthData extends BudgetMonth {
  allocations: AllocationWithCategory[];
}

interface DashboardProps {
  initialYear?: number;
  initialMonth?: number;
  initialData?: {
    profile: Awaited<ReturnType<typeof getUserProfile>> | null;
    budgetMonth: BudgetMonthData | null;
    categories: Category[];
  };
}

export function Dashboard({ initialYear, initialMonth, initialData }: DashboardProps) {
  const [isPending, startTransition] = useTransition();
  const current = getCurrentMonth();
  const year = initialYear ?? current.year;
  const month = initialMonth ?? current.month;
  const isReadOnly = !isCurrentMonth(year, month);

  const [loading, setLoading] = useState(!initialData);
  const [budgetMonth, setBudgetMonth] = useState<BudgetMonthData | null>(
    (initialData?.budgetMonth as BudgetMonthData) ?? null
  );
  const [categories, setCategories] = useState<Category[]>(
    initialData?.categories ?? []
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    (initialData?.profile?.currency as CurrencyCode) ?? "SLE"
  );
  const [email, setEmail] = useState<string>(
    initialData?.profile?.email ?? ""
  );

  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showSavingsDialog, setShowSavingsDialog] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Optimistic allocations for instant UI updates
  const [optimisticAllocations, setOptimisticAllocations] = useState<
    AllocationWithCategory[]
  >(
    (initialData?.budgetMonth?.allocations as AllocationWithCategory[]) ?? []
  );

  const didUseInitial = useRef(!!initialData);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, budget, cats] = await Promise.all([
        getUserProfile(),
        getBudgetMonth(year, month),
        getCategories(),
      ]);

      if (profile) {
        setCurrency(profile.currency as CurrencyCode);
        setEmail(profile.email);
      }
      setBudgetMonth(budget as BudgetMonthData);
      setOptimisticAllocations(budget?.allocations || []);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading budget data:", error);
    }
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    if (didUseInitial.current) {
      didUseInitial.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Refresh data after mutations
  function refreshData() {
    startTransition(() => loadData());
  }

  // Optimistic update for allocation
  function handleOptimisticAllocationUpdate(
    categoryId: string,
    newAmount: number
  ) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !budgetMonth) return;

    setOptimisticAllocations((prev) => {
      const existingIndex = prev.findIndex((a) => a.categoryId === categoryId);

      if (newAmount === 0 && existingIndex >= 0) {
        return prev.filter((_, i) => i !== existingIndex);
      } else if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          amount: newAmount as never,
        };
        return updated;
      } else if (newAmount > 0) {
        return [
          ...prev,
          {
            id: `temp-${categoryId}`,
            budgetMonthId: budgetMonth.id,
            categoryId,
            amount: newAmount as never,
            createdAt: new Date(),
            updatedAt: new Date(),
            category,
          } as AllocationWithCategory,
        ];
      }
      return prev;
    });
  }

  async function handleCopyPreviousMonth() {
    if (!budgetMonth) return;
    setIsCopying(true);
    const result = await copyAllocationsFromPreviousMonthForBudget(budgetMonth.id);
    setIsCopying(false);

    if (result?.error) {
      toast.error("Copy failed", { description: result.error });
      return;
    }

    toast.success("Copied previous month allocations");
    refreshData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={email} year={year} month={month} />
        <main className="container py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your budget...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!budgetMonth) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={email} year={year} month={month} />
        <main className="container py-6">
          <p className="text-center text-muted-foreground">
            No budget data found for this month.
          </p>
        </main>
      </div>
    );
  }

  const income = Number(budgetMonth.income);
  const savingsRate = budgetMonth.savingsRate;
  const savingsAmount = income * savingsRate;
  const totalAllocated =
    savingsAmount +
    optimisticAllocations
      .filter((a) => !a.category.isSavings)
      .reduce((sum, a) => sum + Number(a.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header email={email} year={year} month={month} />

      {/* Loading overlay for transitions */}
      {isPending && (
        <div className="fixed top-16 right-4 z-50 bg-card border rounded-lg shadow-lg p-3 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Updating...</span>
        </div>
      )}

      <main className="container py-6 space-y-6">
        {/* Summary Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">Budget Overview</h1>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={() => setShowIncomeDialog(true)}
                >
                  Edit Income
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={() => setShowSavingsDialog(true)}
                >
                  Adjust Savings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={handleCopyPreviousMonth}
                  disabled={isCopying}
                >
                  {isCopying ? "Copying..." : "Copy Last Month"}
                </Button>
              </div>
            )}
          </div>

          <SummaryCard
            income={income}
            savingsRate={savingsRate}
            totalAllocated={totalAllocated}
            currency={currency}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Categories */}
          <CategoryList
            categories={categories}
            allocations={optimisticAllocations}
            budgetMonthId={budgetMonth.id}
            totalIncome={income}
            savingsRate={savingsRate}
            currency={currency}
            isReadOnly={isReadOnly}
            onAllocationUpdate={handleOptimisticAllocationUpdate}
            onRefresh={refreshData}
          />

          {/* Quick Stats / Savings Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Savings Rate</span>
                  <span className="font-medium text-savings">
                    {formatPercentage(savingsRate * 100, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Monthly Savings</span>
                  <span className="font-medium text-savings">
                    {formatCurrency(savingsAmount, currency)}
                  </span>
                </div>
                {budgetMonth.adjustmentReason && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">
                      Reason for lower savings:
                    </p>
                    <p className="text-sm bg-warning/10 p-2 rounded">
                      {budgetMonth.adjustmentReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charts */}
            <AllocationPieChart
              data={[
                {
                  name: "Savings",
                  value: savingsAmount,
                  color: "#6366f1",
                },
                ...categories
                  .filter((c) => !c.isSavings)
                  .map((c) => ({
                    name: c.name,
                    value: optimisticAllocations.find(
                      (a) => a.categoryId === c.id
                    )
                      ? Number(
                          optimisticAllocations.find(
                            (a) => a.categoryId === c.id
                          )!.amount
                        )
                      : 0,
                    color: c.color,
                  })),
              ]}
              currency={currency}
            />

            <AllocationBarChart
              data={[
                {
                  name: "Savings",
                  value: savingsAmount,
                  color: "#6366f1",
                },
                ...categories
                  .filter((c) => !c.isSavings)
                  .map((c) => ({
                    name: c.name,
                    value: optimisticAllocations.find(
                      (a) => a.categoryId === c.id
                    )
                      ? Number(
                          optimisticAllocations.find(
                            (a) => a.categoryId === c.id
                          )!.amount
                        )
                      : 0,
                    color: c.color,
                  })),
              ]}
              currency={currency}
            />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <EditIncomeDialog
        open={showIncomeDialog}
        onOpenChange={setShowIncomeDialog}
        budgetMonthId={budgetMonth.id}
        currentIncome={income}
        currency={currency}
        onSuccess={refreshData}
      />

      <SavingsRateDialog
        open={showSavingsDialog}
        onOpenChange={setShowSavingsDialog}
        budgetMonthId={budgetMonth.id}
        currentRate={savingsRate}
        currentReason={budgetMonth.adjustmentReason}
        income={income}
        currency={currency}
        onSuccess={refreshData}
      />
    </div>
  );
}
