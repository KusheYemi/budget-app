"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MonthPicker } from "./month-picker";
import { cn } from "@/lib/utils";

interface HeaderProps {
  email?: string;
  year: number;
  month: number;
}

export function Header({ email, year, month }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Budget" },
    { href: "/insights", label: "Insights" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-primary">Budget</span>
          <span className="text-muted-foreground">App</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === link.href || (link.href === "/" && pathname.startsWith("/budget"))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Month Picker (only on budget pages) */}
        {(pathname === "/" || pathname.startsWith("/budget")) && (
          <div className="hidden sm:block">
            <MonthPicker year={year} month={month} />
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <UserMenu email={email} />
      </div>

      {/* Mobile Month Picker */}
      {(pathname === "/" || pathname.startsWith("/budget")) && (
        <div className="sm:hidden border-t px-4 py-2">
          <MonthPicker year={year} month={month} />
        </div>
      )}
    </header>
  );
}
