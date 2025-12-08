import { redirect } from "next/navigation";
import { checkOnboardingStatus } from "@/app/actions/auth";
import { OnboardingModal } from "@/components/auth/onboarding-modal";
import { Dashboard } from "@/components/budget/dashboard";

export default async function HomePage() {
  const { needsOnboarding, user } = await checkOnboardingStatus();

  if (!user) {
    redirect("/login");
  }

  if (needsOnboarding) {
    return <OnboardingModal />;
  }

  return <Dashboard />;
}
