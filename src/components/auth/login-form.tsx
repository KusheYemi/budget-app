"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      toast.error("Sign in failed", {
        description: result.error,
      });
      setLoading(false);
    } else {
      toast.success("Welcome back!", {
        description: "You have been signed in successfully.",
      });
      // Server action will redirect
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center lg:text-left"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
        <p className="text-muted-foreground">
          Sign in to continue managing your finances
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-xl"
      >
        <form action={handleSubmit} className="space-y-5">
          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={`text-sm font-medium transition-colors ${
                focusedField === "email" ? "text-primary" : ""
              }`}
            >
              Email address
            </Label>
            <div className="relative">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === "email"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="pl-11 h-12 bg-background/50 border-border/50 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className={`text-sm font-medium transition-colors ${
                  focusedField === "password" ? "text-primary" : ""
                }`}
              >
                Password
              </Label>
              <Link
                href="/reset-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === "password"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="pl-11 pr-12 h-12 bg-background/50 border-border/50 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <motion.div
                  initial={false}
                  animate={{ scale: [1, 0.8, 1] }}
                  transition={{ duration: 0.2 }}
                  key={showPassword ? "hide" : "show"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </motion.div>
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-medium group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            disabled={loading}
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">
              New to Budget App?
            </span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link href="/signup" className="block">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-medium hover:bg-primary/5 hover:border-primary/50 transition-all"
          >
            Create an account
          </Button>
        </Link>
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Users className="w-4 h-4" />
        <span>Join 10,000+ users taking control of their finances</span>
      </motion.div>
    </div>
  );
}
