"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

  // Get allocations from source month
  const sourceAllocations = await prisma.allocation.findMany({
    where: {
      budgetMonthId: fromBudgetMonthId,
      budgetMonth: { userId: user.id },
      category: { isSavings: false }, // Don't copy savings
    },
  });

  try {
    // Create allocations in target month
    for (const allocation of sourceAllocations) {
      await prisma.allocation.upsert({
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
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error copying allocations:", e);
    return { error: "Failed to copy allocations" };
  }
}
