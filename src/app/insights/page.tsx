import { redirect } from "next/navigation";
import { getInsightsData } from "@/app/actions/insights";
import { getUserProfile } from "@/app/actions/auth";
import { InsightsContent } from "@/components/insights/insights-content";
import type { CurrencyCode } from "@/lib/validators";

export default async function InsightsPage() {
  const [profile, insightsData] = await Promise.all([
    getUserProfile(),
    getInsightsData(),
  ]);

  if (!profile) {
    redirect("/login");
  }

  if (!insightsData) {
    redirect("/");
  }

  return (
    <InsightsContent
      data={insightsData}
      currency={profile.currency as CurrencyCode}
      email={profile.email}
    />
  );
}
