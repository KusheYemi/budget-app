import { getUser } from "@/app/actions/auth";
import { ResetRequestForm } from "@/components/auth/reset-request-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage() {
  const user = await getUser();

  if (user) {
    return <ResetPasswordForm email={user.email ?? ""} />;
  }

  return <ResetRequestForm />;
}

