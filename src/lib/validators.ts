import { z } from "zod";

// Currency codes and their symbols
export const CURRENCIES = {
  SLE: { code: "SLE", symbol: "Le", name: "Sierra Leone Leone" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Auth schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Budget schemas
export const incomeSchema = z.object({
  amount: z
    .number({ error: "Please enter a valid number" })
    .positive("Income must be a positive number")
    .max(999999999999, "Income is too large"),
});

export const savingsRateSchema = z.object({
  rate: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Savings rate cannot be negative")
    .max(100, "Savings rate cannot exceed 100%"),
  reason: z.string().nullable(),
}).refine(
  (data) => data.rate >= 20 || (data.reason && data.reason.trim().length >= 10),
  {
    message: "Please provide a reason (at least 10 characters) for saving less than 20%",
    path: ["reason"],
  }
);

// Category schemas
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or less")
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex color"),
});

// Allocation schema
export const allocationSchema = z.object({
  categoryId: z.string().uuid("Invalid category"),
  amount: z
    .number({ error: "Please enter a valid number" })
    .min(0, "Amount cannot be negative"),
});

// Onboarding schema
export const onboardingSchema = z.object({
  income: z
    .number({ error: "Please enter a valid number" })
    .positive("Income must be a positive number"),
  currency: z.enum(["SLE", "USD", "GBP", "EUR", "NGN"] as const),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type SavingsRateInput = z.infer<typeof savingsRateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type AllocationInput = z.infer<typeof allocationSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
