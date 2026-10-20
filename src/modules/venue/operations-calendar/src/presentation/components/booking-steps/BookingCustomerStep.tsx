"use client";

import React from "react";
import { Search, UserPlus } from "lucide-react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";

interface BookingCustomerStepProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  quickAddOpen: boolean;
  onToggleQuickAdd: () => void;
  quickName: string;
  onQuickNameChange: (val: string) => void;
  quickPhone: string;
  onQuickPhoneChange: (val: string) => void;
  quickEmail: string;
  onQuickEmailChange: (val: string) => void;
  quickAddError: string | null;
  duplicateWarning: string | null;
  submitting: boolean;
  onQuickAddCustomer: () => void;
  selectedCustomer: CustomerSummary | null;
  onSelectCustomer: (cust: CustomerSummary | null) => void;
  customerSearch: string;
  onCustomerSearchChange: (val: string) => void;
  customerSearching: boolean;
  customerSearchError: boolean;
  customerResults: CustomerSummary[];
  onAdvanceToPricing: () => void;
}

export function BookingCustomerStep({
  t,
  quickAddOpen,
  onToggleQuickAdd,
  quickName,
  onQuickNameChange,
  quickPhone,
  onQuickPhoneChange,
  quickEmail,
  onQuickEmailChange,
  quickAddError,
  duplicateWarning,
  submitting,
  onQuickAddCustomer,
  selectedCustomer,
  onSelectCustomer,
  customerSearch,
  onCustomerSearchChange,
  customerSearching,
  customerSearchError,
  customerResults,
  onAdvanceToPricing,
}: BookingCustomerStepProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-nx-ink">
          {t("operationsCalendar.clickToBook.customer.title")}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleQuickAdd}
          className="text-nx-primary inline-flex h-auto items-center gap-1 px-0 text-xs font-semibold hover:underline"
        >
          <UserPlus className="size-3" />
          <span>
            {quickAddOpen
              ? t("operationsCalendar.clickToBook.customer.searchExisting")
              : t("operationsCalendar.clickToBook.customer.addNew")}
          </span>
        </Button>
      </div>

      {/* Quick Add Form */}
      {quickAddOpen ? (
        <div className="border-nx-border bg-nx-raised/40 space-y-2.5 rounded-xl border p-3.5">
          <h5 className="text-xs font-bold text-nx-ink">
            {t("operationsCalendar.clickToBook.customer.quickAddTitle")}
          </h5>

          {quickAddError && (
            <Alert variant="destructive" className="py-1.5 text-xs">
              <AlertDescription>{quickAddError}</AlertDescription>
            </Alert>
          )}

          {duplicateWarning && (
            <Alert variant="warning" className="py-1.5 text-xs">
              <AlertDescription>{duplicateWarning}</AlertDescription>
            </Alert>
          )}

          <Input
            placeholder={t("operationsCalendar.clickToBook.customer.namePlaceholder")}
            value={quickName}
            onChange={(e) => onQuickNameChange(e.target.value)}
            className="h-8 bg-nx-surface text-xs"
          />
          <Input
            placeholder={t("operationsCalendar.clickToBook.customer.phonePlaceholder")}
            value={quickPhone}
            onChange={(e) => onQuickPhoneChange(e.target.value)}
            className="h-8 bg-nx-surface text-xs"
          />
          <Input
            placeholder={t("operationsCalendar.clickToBook.customer.emailPlaceholder")}
            value={quickEmail}
            onChange={(e) => onQuickEmailChange(e.target.value)}
            className="h-8 bg-nx-surface text-xs"
          />
          <Button
            type="button"
            size="sm"
            onClick={onQuickAddCustomer}
            disabled={!quickName.trim() || submitting}
            className="h-8 w-full bg-[#C6FF00] text-xs font-bold text-[#0D0D0E] hover:bg-[#b5eb00]"
          >
            {submitting
              ? t("operationsCalendar.clickToBook.customer.creating")
              : t("operationsCalendar.clickToBook.customer.createAndSelect")}
          </Button>
        </div>
      ) : selectedCustomer ? (
        /* Selected Customer Card */
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 dark:border-[#C6FF00]/30 dark:bg-[#C6FF00]/5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-600 ring-1 ring-emerald-500/30 dark:bg-[#C6FF00]/15 dark:text-[#C6FF00] dark:ring-[#C6FF00]/30">
              {selectedCustomer.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-nx-ink">{selectedCustomer.displayName}</p>
                <span className="inline-flex items-center rounded bg-nx-raised px-1.5 py-0.5 text-[10px] font-medium text-nx-ink-2">
                  {selectedCustomer.type || "Customer"}
                </span>
              </div>
              <p className="text-[10px] text-nx-ink-2">
                {selectedCustomer.phone || "Active Customer"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectCustomer(null)}
            className="h-7 text-xs font-semibold text-emerald-600 hover:underline dark:text-[#C6FF00]"
          >
            {t("operationsCalendar.clickToBook.customer.change")}
          </Button>
        </div>
      ) : (
        /* Search Customer Input & Results */
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-nx-ink-3 rtl:left-auto rtl:right-2.5" />
            <Input
              placeholder={t("operationsCalendar.clickToBook.customer.searchPlaceholder")}
              value={customerSearch}
              onChange={(e) => onCustomerSearchChange(e.target.value)}
              className="h-8 rounded-lg ps-8 text-xs"
            />
          </div>

          {customerSearching && (
            <div className="flex items-center justify-center gap-2 p-2 text-center text-xs text-nx-ink-3">
              <LoadingSpinner size="sm" />
              <span>Searching...</span>
            </div>
          )}

          {customerSearchError && (
            <Alert variant="destructive" className="py-1 text-xs">
              <AlertDescription>
                {t("operationsCalendar.clickToBook.customer.searchError")}
              </AlertDescription>
            </Alert>
          )}

          {/* Results List */}
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {customerResults.map((cust, idx) => {
              const avatarPalette = [
                "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
                "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
                "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
                "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/20",
              ];
              const colorClass = avatarPalette[idx % avatarPalette.length];
              return (
                <Button
                  variant="ghost"
                  type="button"
                  key={cust.id}
                  onClick={() => {
                    onSelectCustomer(cust);
                    onAdvanceToPricing();
                  }}
                  className="border-nx-border hover:bg-nx-raised/60 group h-auto w-full justify-between rounded-xl border p-2.5 text-start text-xs transition-colors hover:border-emerald-500/40 dark:hover:border-[#C6FF00]/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full border text-xs font-bold ${colorClass}`}
                    >
                      {cust.displayName.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-semibold text-nx-ink group-hover:text-emerald-600 dark:group-hover:text-[#C6FF00]">
                        {cust.displayName}
                      </span>
                      <span className="block text-[10px] text-nx-ink-3">
                        {cust.phone || cust.type || "Customer"}
                      </span>
                    </div>
                  </div>
                  <div className="border-nx-border flex size-4 shrink-0 items-center justify-center rounded-full border group-hover:border-emerald-500 dark:group-hover:border-[#C6FF00]">
                    <div className="size-2 rounded-full bg-transparent group-hover:bg-emerald-500 dark:group-hover:bg-[#C6FF00]" />
                  </div>
                </Button>
              );
            })}

            {!customerSearching &&
              customerSearch.trim().length >= 2 &&
              customerResults.length === 0 &&
              !customerSearchError && (
                <p className="py-2 text-center text-xs text-nx-ink-3">
                  {t("operationsCalendar.clickToBook.customer.noResults")}
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
