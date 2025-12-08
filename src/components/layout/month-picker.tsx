"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMonth, getCurrentMonth, isCurrentMonth } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MonthPickerProps {
  year: number;
  month: number;
  availableMonths?: { year: number; month: number }[];
}

export function MonthPicker({ year, month }: MonthPickerProps) {
  const router = useRouter();
  const current = getCurrentMonth();
  const isCurrent = isCurrentMonth(year, month);

  function goToPreviousMonth() {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    router.push(`/budget/${newYear}/${newMonth}`);
  }

  function goToNextMonth() {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    // Don't go beyond current month
    if (newYear > current.year || (newYear === current.year && newMonth > current.month)) {
      return;
    }
    router.push(`/budget/${newYear}/${newMonth}`);
  }

  function goToMonth(value: string) {
    const [y, m] = value.split("-").map(Number);
    if (y === current.year && m === current.month) {
      router.push("/");
    } else {
      router.push(`/budget/${y}/${m}`);
    }
  }

  const canGoNext =
    year < current.year || (year === current.year && month < current.month);

  // Generate last 12 months for dropdown
  const monthOptions: { year: number; month: number }[] = [];
  let tempYear = current.year;
  let tempMonth = current.month;
  for (let i = 0; i < 12; i++) {
    monthOptions.push({ year: tempYear, month: tempMonth });
    tempMonth -= 1;
    if (tempMonth < 1) {
      tempMonth = 12;
      tempYear -= 1;
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span className="sr-only">Previous month</span>
      </Button>

      <Select
        value={`${year}-${month}`}
        onValueChange={goToMonth}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>{formatMonth(year, month)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((opt) => (
            <SelectItem key={`${opt.year}-${opt.month}`} value={`${opt.year}-${opt.month}`}>
              {formatMonth(opt.year, opt.month)}
              {isCurrentMonth(opt.year, opt.month) && (
                <span className="ml-2 text-xs text-muted-foreground">(Current)</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNextMonth}
        disabled={!canGoNext}
      >
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
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="sr-only">Next month</span>
      </Button>

      {!isCurrent && (
        <Badge variant="secondary" className="ml-2">
          Read-only
        </Badge>
      )}
    </div>
  );
}
