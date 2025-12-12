"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isCurrentMonth } from "@/lib/utils";

export async function getAllocations(budgetMonthId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const allocations = await prisma.allocation.findMany({
    where: {
      budgetMonthId,
      budgetMonth: {
        userId: user.id,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      category: {
        sortOrder: "asc",
      },
    },
  });

  return allocations;
}

export async function updateAllocation(
  budgetMonthId: string,
  categoryId: string,
  amount: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (amount < 0) {
    return { error: "Amount cannot be negative" };
  }

  // Verify the budget month belongs to the user
  const budgetMonth = await prisma.budgetMonth.findFirst({
    where: { id: budgetMonthId, userId: user.id },
  });

  if (!budgetMonth) {
    return { error: "Budget month not found" };
  }

  // Verify the category belongs to the user
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });

  if (!category) {
    return { error: "Category not found" };
  }

  // Don't allow allocations for the Savings category (it's computed)
  if (category.isSavings) {
    return { error: "Savings allocation is calculated automatically" };
  }

  try {
    if (amount === 0) {
      // Delete the allocation if amount is 0
      await prisma.allocation.deleteMany({
        where: {
          budgetMonthId,
          categoryId,
        },
      });
    } else {
      // Upsert the allocation
      await prisma.allocation.upsert({
        where: {
          budgetMonthId_categoryId: {
            budgetMonthId,
            categoryId,
          },
        },
        update: { amount },
        create: {
          budgetMonthId,
          categoryId,
          amount,
        },
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error updating allocation:", e);
    return { error: "Failed to update allocation" };
  }
}

export async function deleteAllocation(allocationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the allocation belongs to the user
  const allocation = await prisma.allocation.findFirst({
    where: {
      id: allocationId,
      budgetMonth: {
        userId: user.id,
      },
    },
  });

  if (!allocation) {
    return { error: "Allocation not found" };
  }

  try {
    await prisma.allocation.delete({
      where: { id: allocationId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error deleting allocation:", e);
    return { error: "Failed to delete allocation" };
  }
}

export async function copyAllocationsFromPreviousMonth(
  toBudgetMonthId: string,
  fromBudgetMonthId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify the target budget month belongs to the user (prevents IDOR)
  const targetBudgetMonth = await prisma.budgetMonth.findFirst({
    where: { id: toBudgetMonthId, userId: user.id },
  });

  if (!targetBudgetMonth) {
    return { error: "Budget month not found" };
  }

  // Get allocations from source month
  const sourceAllocations = await prisma.allocation.findMany({
    where: {
      budgetMonthId: fromBudgetMonthId,
      budgetMonth: { userId: user.id },
      category: { isSavings: false }, // Don't copy savings
    },
  });

  try {
    await prisma.$transaction(
      sourceAllocations.map((allocation) =>
        prisma.allocation.upsert({
          where: {
            budgetMonthId_categoryId: {
              budgetMonthId: toBudgetMonthId,
              categoryId: allocation.categoryId,
            },
          },
          update: { amount: allocation.amount },
          create: {
            budgetMonthId: toBudgetMonthId,
            categoryId: allocation.categoryId,
            amount: allocation.amount,
          },
        })
      )
    );

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error copying allocations:", e);
    return { error: "Failed to copy allocations" };
  }
}

export async function copyAllocationsFromPreviousMonthForBudget(
  budgetMonthId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const targetBudgetMonth = await prisma.budgetMonth.findFirst({
    where: { id: budgetMonthId, userId: user.id },
  });

  if (!targetBudgetMonth) {
    return { error: "Budget month not found" };
  }

  if (!isCurrentMonth(targetBudgetMonth.year, targetBudgetMonth.month)) {
    return { error: "Cannot copy into a historical month" };
  }

  let prevYear = targetBudgetMonth.year;
  let prevMonth = targetBudgetMonth.month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const previousBudgetMonth = await prisma.budgetMonth.findFirst({
    where: {
      userId: user.id,
      year: prevYear,
      month: prevMonth,
    },
  });

  if (!previousBudgetMonth) {
    return { error: "No previous month found to copy from" };
  }

  return copyAllocationsFromPreviousMonth(
    targetBudgetMonth.id,
    previousBudgetMonth.id
  );
}
