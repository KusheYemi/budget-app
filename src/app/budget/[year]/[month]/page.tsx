import { Dashboard } from "@/components/budget/dashboard";
import { notFound, redirect } from "next/navigation";
import { getBudgetMonth } from "@/app/actions/budget";
import { getCategories } from "@/app/actions/categories";
import { getUserProfile } from "@/app/actions/auth";

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
  }>;
}

export default async function HistoricalBudgetPage({ params }: PageProps) {
  const { year, month } = await params;

  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  // Validate year and month
  if (
    isNaN(yearNum) ||
    isNaN(monthNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 2020 ||
    yearNum > 2100
  ) {
    notFound();
  }

  const [profile, budgetMonth, categories] = await Promise.all([
    getUserProfile(),
    getBudgetMonth(yearNum, monthNum),
    getCategories(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  return (
    <Dashboard
      initialYear={yearNum}
      initialMonth={monthNum}
      initialData={{ profile, budgetMonth: budgetMonth as never, categories }}
    />
  );
}
