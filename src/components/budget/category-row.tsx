"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatCurrency,
  formatPercentage,
  calculatePercentage,
} from "@/lib/utils";
import { updateAllocation } from "@/app/actions/allocations";
import { deleteCategory } from "@/app/actions/categories";
import type { CurrencyCode } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CategoryRowProps {
  id: string;
  budgetMonthId: string;
  name: string;
  color: string;
  amount: number;
  totalIncome: number;
  currency: CurrencyCode;
  isSavings: boolean;
  isReadOnly: boolean;
  onUpdate?: (categoryId: string, amount: number) => void;
  onRefresh?: () => void;
  onDelete?: (categoryId: string) => void;
}

export function CategoryRow({
  id,
  budgetMonthId,
  name,
  color,
  amount,
  totalIncome,
  currency,
  isSavings,
  isReadOnly,
  onUpdate,
  onRefresh,
  onDelete,
}: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(amount.toString());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditValue(amount.toString());
  }, [amount]);

  const percentage = calculatePercentage(amount, totalIncome);

  async function handleSave() {
    const newAmount = parseFloat(editValue) || 0;
    if (newAmount === amount) {
      setIsEditing(false);
      return;
    }

    // Optimistic update
    onUpdate?.(id, newAmount);
    setIsEditing(false);

    // Background save
    setIsLoading(true);
    const result = await updateAllocation(budgetMonthId, id, newAmount);
    setIsLoading(false);

    if (result.success) {
      onRefresh?.();
    } else {
      // Revert on error
      onUpdate?.(id, amount);
      toast.error("Failed to update allocation", {
        description: result.error ?? "Please try again.",
      });
    }
  }

  async function handleDelete() {
    if (isSavings) return;

    const confirmed = confirm(
      `Delete category "${name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    const result = await deleteCategory(id);
    setIsLoading(false);

    if (result.success) {
      onDelete?.(id);
      onRefresh?.();
      toast.success("Category deleted");
    } else {
      toast.error("Failed to delete category", {
        description: result.error ?? "Please try again.",
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(amount.toString());
      setIsEditing(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        isSavings && "bg-savings/5 border-savings/20"
      )}
    >
      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Category name */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", isSavings && "text-savings")}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatPercentage(percentage, 1)} of income
        </p>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-1 sm:gap-2">
        {isEditing && !isReadOnly && !isSavings ? (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-20 sm:w-28 text-right text-sm"
            min="0"
            step="0.01"
            autoFocus
            disabled={isLoading}
          />
        ) : (
          <button
            onClick={() => !isReadOnly && !isSavings && setIsEditing(true)}
            className={cn(
              "text-right font-mono tabular-nums text-sm sm:text-base px-1 sm:px-2 py-1 rounded",
              !isReadOnly && !isSavings && "hover:bg-accent cursor-pointer",
              (isReadOnly || isSavings) && "cursor-default"
            )}
            disabled={isReadOnly || isSavings}
          >
            {formatCurrency(amount, currency)}
          </button>
        )}

        {/* Actions menu */}
        {!isReadOnly && !isSavings && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Edit amount
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
                disabled={isLoading}
              >
                Delete category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
