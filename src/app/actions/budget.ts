"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMonth, MIN_SAVINGS_RATE } from "@/lib/utils";

// Helper to serialize Prisma Decimal to number for client components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeBudgetMonth(budgetMonth: any) {
  if (!budgetMonth) return null;
  return {
    ...budgetMonth,
    income: Number(budgetMonth.income),
    allocations: budgetMonth.allocations?.map((a: { amount: unknown; [key: string]: unknown }) => ({
      ...a,
      amount: Number(a.amount),
    })) ?? [],
  };
}

export async function getBudgetMonth(year?: number, month?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const current = getCurrentMonth();
  const targetYear = year ?? current.year;
  const targetMonth = month ?? current.month;

  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: {
      userId_year_month: {
        userId: user.id,
        year: targetYear,
        month: targetMonth,
      },
    },
    include: {
      allocations: {
        include: {
          category: true,
        },
        orderBy: {
          category: {
            sortOrder: "asc",
          },
        },
      },
    },
  });

  return serializeBudgetMonth(budgetMonth);
}

export async function getOrCreateBudgetMonth(year: number, month: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let budgetMonth = await prisma.budgetMonth.findUnique({
    where: {
      userId_year_month: {
        userId: user.id,
        year,
        month,
      },
    },
    include: {
      allocations: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!budgetMonth) {
    // Get the most recent budget month to copy income from
    const lastBudget = await prisma.budgetMonth.findFirst({
      where: { userId: user.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    budgetMonth = await prisma.budgetMonth.create({
      data: {
        userId: user.id,
        year,
        month,
        income: lastBudget?.income ?? 0,
        savingsRate: 0.20,
      },
      include: {
        allocations: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  return serializeBudgetMonth(budgetMonth);
}

export async function updateIncome(budgetMonthId: string, income: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (income < 0) {
    return { error: "Income cannot be negative" };
  }

  try {
    await prisma.budgetMonth.update({
      where: {
        id: budgetMonthId,
        userId: user.id,
      },
      data: { income },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error updating income:", e);
    return { error: "Failed to update income" };
  }
}

export async function updateSavingsRate(
  budgetMonthId: string,
  savingsRate: number,
  reason?: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Validate savings rate
  if (savingsRate < 0 || savingsRate > 1) {
    return { error: "Savings rate must be between 0% and 100%" };
  }

  // Require reason if below minimum
  if (savingsRate < MIN_SAVINGS_RATE && (!reason || reason.trim().length < 10)) {
    return {
      error: "Please provide a reason (at least 10 characters) for saving less than 20%",
    };
  }

  try {
    await prisma.budgetMonth.update({
      where: {
        id: budgetMonthId,
        userId: user.id,
      },
      data: {
        savingsRate,
        adjustmentReason: savingsRate < MIN_SAVINGS_RATE ? reason : null,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error updating savings rate:", e);
    return { error: "Failed to update savings rate" };
  }
}

export async function getAllBudgetMonths() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const budgetMonths = await prisma.budgetMonth.findMany({
    where: { userId: user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      allocations: {
        include: {
          category: true,
        },
      },
    },
  });

  return budgetMonths.map(bm => serializeBudgetMonth(bm));
}
