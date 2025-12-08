"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCategories() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });

  return categories;
}

export async function createCategory(name: string, color?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!name || name.trim().length === 0) {
    return { error: "Category name is required" };
  }

  if (name.trim().length > 50) {
    return { error: "Category name must be 50 characters or less" };
  }

  try {
    // Get the highest sort order
    const lastCategory = await prisma.category.findFirst({
      where: { userId: user.id },
      orderBy: { sortOrder: "desc" },
    });

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: name.trim(),
        color: color ?? "#6366f1",
        sortOrder: (lastCategory?.sortOrder ?? -1) + 1,
      },
    });

    revalidatePath("/");
    return { success: true, category };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return { error: "A category with this name already exists" };
    }
    console.error("Error creating category:", e);
    return { error: "Failed to create category" };
  }
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; color?: string }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if it's the savings category
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });

  if (!category) {
    return { error: "Category not found" };
  }

  if (category.isSavings && data.name) {
    return { error: "Cannot rename the Savings category" };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name?.trim(),
        color: data.color,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return { error: "A category with this name already exists" };
    }
    console.error("Error updating category:", e);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if it's the savings category
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });

  if (!category) {
    return { error: "Category not found" };
  }

  if (category.isSavings) {
    return { error: "Cannot delete the Savings category" };
  }

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error deleting category:", e);
    return { error: "Failed to delete category" };
  }
}

export async function reorderCategories(categoryIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  try {
    await prisma.$transaction(
      categoryIds.map((id, index) =>
        prisma.category.update({
          where: { id, userId: user.id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Error reordering categories:", e);
    return { error: "Failed to reorder categories" };
  }
}
