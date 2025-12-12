import { redirect } from "next/navigation";
import { checkOnboardingStatus, getUserProfile } from "@/app/actions/auth";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Dashboard } from "@/components/budget/dashboard";
import { getBudgetMonth } from "@/app/actions/budget";
import { getCategories } from "@/app/actions/categories";

export default async function DashboardPage() {
  const { needsOnboarding, user } = await checkOnboardingStatus();

  if (!user) {
    redirect("/login");
  }

  if (needsOnboarding) {
    return <OnboardingModal />;
  }

  const [profile, budgetMonth, categories] = await Promise.all([
    getUserProfile(),
    getBudgetMonth(),
    getCategories(),
  ]);

  return (
    <Dashboard
      initialData={{ profile, budgetMonth: budgetMonth as never, categories }}
    />
  );
}
