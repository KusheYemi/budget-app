"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { MIN_SAVINGS_RATE } from "@/lib/utils";

export interface MonthlyData {
  year: number;
  month: number;
  income: number;
  savingsRate: number;
  savingsAmount: number;
  totalAllocated: number;
  adjustmentReason: string | null;
}

export interface CategoryTotal {
  name: string;
  color: string;
  total: number;
}

export interface InsightsData {
  averageIncome: number;
  averageSavingsRate: number;
  averageSavingsAmount: number;
  totalSaved: number;
  totalMonths: number;
  monthsWithLowSavings: MonthlyData[];
  topCategories: CategoryTotal[];
  monthlyTrends: MonthlyData[];
}

export async function getInsightsData(): Promise<InsightsData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get all budget months with allocations
  const budgetMonths = await prisma.budgetMonth.findMany({
    where: { userId: user.id },
    include: {
      allocations: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  if (budgetMonths.length === 0) {
    return {
      averageIncome: 0,
      averageSavingsRate: 0,
      averageSavingsAmount: 0,
      totalSaved: 0,
      totalMonths: 0,
      monthsWithLowSavings: [],
      topCategories: [],
      monthlyTrends: [],
    };
  }

  // Calculate monthly data
  const monthlyTrends: MonthlyData[] = budgetMonths.map((bm) => {
    const income = Number(bm.income);
    const savingsAmount = income * bm.savingsRate;
    const totalAllocated =
      savingsAmount +
      bm.allocations
        .filter((a) => !a.category.isSavings)
        .reduce((sum, a) => sum + Number(a.amount), 0);

    return {
      year: bm.year,
      month: bm.month,
      income,
      savingsRate: bm.savingsRate,
      savingsAmount,
      totalAllocated,
      adjustmentReason: bm.adjustmentReason,
    };
  });

  // Calculate averages
  const totalMonths = monthlyTrends.length;
  const averageIncome =
    monthlyTrends.reduce((sum, m) => sum + m.income, 0) / totalMonths;
  const averageSavingsRate =
    monthlyTrends.reduce((sum, m) => sum + m.savingsRate, 0) / totalMonths;
  const averageSavingsAmount =
    monthlyTrends.reduce((sum, m) => sum + m.savingsAmount, 0) / totalMonths;
  const totalSaved = monthlyTrends.reduce((sum, m) => sum + m.savingsAmount, 0);

  // Get months with low savings (below 20%)
  const monthsWithLowSavings = monthlyTrends.filter(
    (m) => m.savingsRate < MIN_SAVINGS_RATE
  );

  // Calculate category totals (excluding savings)
  const categoryTotals = new Map<
    string,
    { name: string; color: string; total: number }
  >();

  for (const bm of budgetMonths) {
    for (const allocation of bm.allocations) {
      if (allocation.category.isSavings) continue;

      const existing = categoryTotals.get(allocation.category.id);
      if (existing) {
        existing.total += Number(allocation.amount);
      } else {
        categoryTotals.set(allocation.category.id, {
          name: allocation.category.name,
          color: allocation.category.color,
          total: Number(allocation.amount),
        });
      }
    }
  }

  // Sort by total and get top 5
  const topCategories = Array.from(categoryTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    averageIncome,
    averageSavingsRate,
    averageSavingsAmount,
    totalSaved,
    totalMonths,
    monthsWithLowSavings,
    topCategories,
    monthlyTrends,
  };
}
