"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";
import { z } from "zod";

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

  const parsed = categorySchema.safeParse({
    name,
    color: color ?? "#6366f1",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category" };
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
        name: parsed.data.name,
        color: parsed.data.color,
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

  const updates: { name?: string; color?: string } = {};

  if (data.name !== undefined) {
    const parsedName = categorySchema.shape.name.safeParse(data.name);
    if (!parsedName.success) {
      return { error: parsedName.error.issues[0]?.message ?? "Invalid name" };
    }
    updates.name = parsedName.data;
  }

  if (data.color !== undefined) {
    const parsedColor = categorySchema.shape.color.safeParse(data.color);
    if (!parsedColor.success) {
      return {
        error: parsedColor.error.issues[0]?.message ?? "Invalid color",
      };
    }
    updates.color = parsedColor.data;
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: updates,
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

  const idsParsed = z.array(z.string().uuid()).min(1).max(100).safeParse(categoryIds);
  if (!idsParsed.success) {
    return { error: "Invalid category order" };
  }

  try {
    await prisma.$transaction(
      idsParsed.data.map((id, index) =>
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
