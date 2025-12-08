import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { CURRENCIES, type CurrencyCode } from "./validators";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(amount: number, currencyCode: CurrencyCode = "SLE"): string {
  const currency = CURRENCIES[currencyCode];
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency.symbol}${formattedNumber}`;
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Calculate percentage of total
export function calculatePercentage(amount: number, total: number): number {
  if (total === 0) return 0;
  return (amount / total) * 100;
}

// Format month for display
export function formatMonth(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return format(date, "MMMM yyyy");
}

// Get current month and year
export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-indexed
  };
}

// Check if a month is the current month
export function isCurrentMonth(year: number, month: number): boolean {
  const current = getCurrentMonth();
  return year === current.year && month === current.month;
}

// Check if a month is in the past
export function isPastMonth(year: number, month: number): boolean {
  const current = getCurrentMonth();
  if (year < current.year) return true;
  if (year === current.year && month < current.month) return true;
  return false;
}

// Default categories for new users
export const DEFAULT_CATEGORIES = [
  { name: "Savings", color: "#6366f1", isSavings: true, sortOrder: 0 },
  { name: "Transport & Food", color: "#f59e0b", isSavings: false, sortOrder: 1 },
  { name: "Utilities", color: "#10b981", isSavings: false, sortOrder: 2 },
  { name: "Partner & Child Support", color: "#ec4899", isSavings: false, sortOrder: 3 },
  { name: "Subscriptions", color: "#8b5cf6", isSavings: false, sortOrder: 4 },
  { name: "Fun", color: "#06b6d4", isSavings: false, sortOrder: 5 },
  { name: "Remittance", color: "#f97316", isSavings: false, sortOrder: 6 },
] as const;

// Minimum savings rate threshold
export const MIN_SAVINGS_RATE = 0.20;
export const MIN_SAVINGS_RATE_PERCENT = 20;
