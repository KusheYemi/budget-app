import { Dashboard } from "@/components/budget/dashboard";
import { notFound } from "next/navigation";

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

  return <Dashboard initialYear={yearNum} initialMonth={monthNum} />;
}
