"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES, getCurrentMonth } from "@/lib/utils";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Create user record in our database
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          currency: "SLE",
        },
      });
    } catch (e) {
      // User might already exist if they signed up before
      console.error("Error creating user:", e);
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return profile;
}

export async function checkOnboardingStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { needsOnboarding: false, user: null };

  // Check if user has a profile with categories
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      categories: true,
      budgetMonths: true,
    },
  });

  // If no profile, or no categories, or no budget months, needs onboarding
  const needsOnboarding =
    !profile ||
    profile.categories.length === 0 ||
    profile.budgetMonths.length === 0;

  return { needsOnboarding, user: profile };
}

export async function completeOnboarding(data: {
  income: number;
  currency: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { year, month } = getCurrentMonth();

  try {
    // Update or create user with currency
    await prisma.user.upsert({
      where: { id: user.id },
      update: { currency: data.currency },
      create: {
        id: user.id,
        email: user.email!,
        currency: data.currency,
      },
    });

    // Create default categories
    for (const category of DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: category.name,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name: category.name,
          color: category.color,
          isSavings: category.isSavings,
          isDefault: true,
          sortOrder: category.sortOrder,
        },
      });
    }

    // Create first budget month
    await prisma.budgetMonth.upsert({
      where: {
        userId_year_month: {
          userId: user.id,
          year,
          month,
        },
      },
      update: { income: data.income },
      create: {
        userId: user.id,
        year,
        month,
        income: data.income,
        savingsRate: 0.20,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    console.error("Error completing onboarding:", e);
    return { error: "Failed to complete onboarding" };
  }
}
