import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/auth";
import { SettingsContent } from "@/components/settings/settings-content";
import { getCurrentMonth } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/validators";

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/login");
  }

  const { year, month } = getCurrentMonth();

  return (
    <SettingsContent
      email={profile.email}
      currency={profile.currency as CurrencyCode}
      year={year}
      month={month}
    />
  );
}

