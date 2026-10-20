"use client";

import React from "react";
import { Search, User, UserPlus } from "lucide-react";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";

interface CustomerQuickLookupProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searching: boolean;
  results: CustomerSummary[];
  selectedCustomer: CustomerSummary | null;
  onSelectCustomer: (customer: CustomerSummary) => void;
  onOpenQuickAdd?: () => void;
  searchPlaceholder?: string;
  addNewLabel?: string;
  emptyLabel?: string;
  className?: string;
}

export function CustomerQuickLookup({
  searchQuery,
  onSearchChange,
  searching,
  results,
  selectedCustomer,
  onSelectCustomer,
  onOpenQuickAdd,
  searchPlaceholder = "Search customer by name, phone or email...",
  addNewLabel = "+ New Customer",
  emptyLabel = "No customers found.",
  className,
}: CustomerQuickLookupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-nx-muted pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="border-nx-line bg-nx-surface pl-9 text-sm text-nx-ink"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        {onOpenQuickAdd && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenQuickAdd}
            className="hover:bg-nx-surface-raised shrink-0 gap-1.5 border-nx-line"
          >
            <UserPlus className="size-3.5 text-nx-accent" />
            <span>{addNewLabel}</span>
          </Button>
        )}
      </div>

      {searchQuery.trim().length >= 2 && (
        <div className="divide-nx-line/50 max-h-48 divide-y overflow-y-auto rounded-lg border border-nx-line bg-nx-surface">
          {results.length > 0 ? (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCustomer(c)}
                className={cn(
                  "flex w-full items-center justify-between p-2.5 text-left text-sm transition-colors",
                  selectedCustomer?.id === c.id
                    ? "bg-nx-accent/15 text-nx-accent-hi"
                    : "hover:bg-nx-surface-raised text-nx-ink"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <User className="text-nx-muted size-4 shrink-0" />
                  <div>
                    <p className="font-medium">{c.displayName || c.name || "Customer"}</p>
                    <p className="text-nx-muted text-xs">
                      {[c.phone, c.email].filter(Boolean).join(" · ") || c.type || ""}
                    </p>
                  </div>
                </div>
                {selectedCustomer?.id === c.id && (
                  <span className="text-xs font-semibold text-nx-accent">Selected</span>
                )}
              </button>
            ))
          ) : !searching ? (
            <div className="text-nx-muted p-4 text-center text-xs">{emptyLabel}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
