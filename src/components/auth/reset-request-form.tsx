"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmail } from "@/app/actions/auth";

export function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await sendPasswordResetEmail(email);
    setLoading(false);

    if (result?.error) {
      toast.error("Reset failed", { description: result.error });
      return;
    }

    setSent(true);
    toast.success("Check your email", {
      description: "We sent you a password reset link.",
    });
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center lg:text-left"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          Reset your password
        </h2>
        <p className="text-muted-foreground">
          Enter your email and we’ll send you a reset link.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 lg:p-8 shadow-xl"
      >
        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium">{email}</span>,
              you’ll receive an email shortly.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full h-12 rounded-xl">
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-11 h-12 bg-background/50 border-border/50 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send reset link
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <Link href="/login" className="block">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl text-base font-medium hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                Back to login
              </Button>
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}

