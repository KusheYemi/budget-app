"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { updateCurrency, updatePassword } from "@/app/actions/auth";
import { CURRENCIES, type CurrencyCode } from "@/lib/validators";

interface SettingsContentProps {
  email: string;
  currency: CurrencyCode;
  year: number;
  month: number;
}

export function SettingsContent({
  email,
  currency,
  year,
  month,
}: SettingsContentProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateCurrency(selectedCurrency);
    setSaving(false);

    if (result?.error) {
      toast.error("Failed to update settings", {
        description: result.error,
      });
      return;
    }

    toast.success("Settings updated");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || !confirmNewPassword) {
      setPasswordError("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    const result = await updatePassword(newPassword);
    setChangingPassword(false);

    if (result?.error) {
      setPasswordError(result.error);
      toast.error("Failed to change password", {
        description: result.error,
      });
      return;
    }

    setNewPassword("");
    setConfirmNewPassword("");
    toast.success("Password updated");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={email} year={year} month={month} />

      <main className="container py-4 sm:py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account preferences.
          </p>
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>
              Your currency affects how amounts are displayed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Preferred currency</Label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) =>
                  setSelectedCurrency(value as CurrencyCode)
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </CardContent>
        </Card>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-lg">Security</CardTitle>
            <CardDescription>
              Change your password. Must be at least 8 characters and include an uppercase letter, lowercase letter, and a number.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {passwordError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={changingPassword}
                    className="pl-9 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowNewPassword((v) => !v)}
                    disabled={changingPassword}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={changingPassword}
                    className="pl-9 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    disabled={changingPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
