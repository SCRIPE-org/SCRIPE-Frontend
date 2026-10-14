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
        <button
          type="button"
          onClick={onToggleQuickAdd}
          className="text-xs text-nx-primary hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <UserPlus className="size-3" />
          <span>
            {quickAddOpen
              ? t("operationsCalendar.clickToBook.customer.searchExisting")
              : t("operationsCalendar.clickToBook.customer.addNew")}
          </span>
        </button>
      </div>

      {/* Quick Add Form */}
      {quickAddOpen ? (
        <div className="p-3 rounded-xl border border-nx-border bg-nx-raised/40 space-y-2.5">
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
            className="h-8 text-xs bg-nx-surface"
          />
          <Input
            placeholder={t("operationsCalendar.clickToBook.customer.phonePlaceholder")}
            value={quickPhone}
            onChange={(e) => onQuickPhoneChange(e.target.value)}
            className="h-8 text-xs bg-nx-surface"
          />
          <Input
            placeholder={t("operationsCalendar.clickToBook.customer.emailPlaceholder")}
            value={quickEmail}
            onChange={(e) => onQuickEmailChange(e.target.value)}
            className="h-8 text-xs bg-nx-surface"
          />
          <Button
            type="button"
            size="sm"
            onClick={onQuickAddCustomer}
            disabled={!quickName.trim() || submitting}
            className="h-7 text-xs w-full font-bold bg-nx-primary hover:bg-nx-primary-hover text-white"
          >
            {submitting
              ? t("operationsCalendar.clickToBook.customer.creating")
              : t("operationsCalendar.clickToBook.customer.createAndSelect")}
          </Button>
        </div>
      ) : selectedCustomer ? (
        /* Selected Customer Card */
        <div className="flex items-center justify-between p-3 rounded-xl border border-nx-primary/40 bg-nx-primary/5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-nx-primary text-white font-bold text-xs">
              {selectedCustomer.displayName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-nx-ink">
                {selectedCustomer.displayName}
              </p>
              <p className="text-[10px] text-nx-ink-2">
                {selectedCustomer.type || "Customer"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectCustomer(null)}
            className="h-7 text-xs text-nx-ink-2 hover:text-nx-ink"
          >
            {t("operationsCalendar.clickToBook.customer.change")}
          </Button>
        </div>
      ) : (
        /* Search Customer Input & Results */
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-nx-ink-3 rtl:right-2.5 rtl:left-auto" />
            <Input
              placeholder={t("operationsCalendar.clickToBook.customer.searchPlaceholder")}
              value={customerSearch}
              onChange={(e) => onCustomerSearchChange(e.target.value)}
              className="ps-8 h-8 text-xs rounded-lg"
            />
          </div>

          {customerSearching && (
            <div className="p-2 text-center text-xs text-nx-ink-3 flex items-center justify-center gap-2">
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
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {customerResults.map((cust) => (
              <button
                type="button"
                key={cust.id}
                onClick={() => {
                  onSelectCustomer(cust);
                  onAdvanceToPricing();
                }}
                className="w-full p-2 rounded-lg border border-nx-border hover:border-nx-primary hover:bg-nx-primary/5 text-start flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-nx-raised text-nx-ink font-bold text-xs">
                    {cust.displayName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-nx-ink block">
                      {cust.displayName}
                    </span>
                    <span className="text-[10px] text-nx-ink-3 block">
                      {cust.type}
                    </span>
                  </div>
                </div>
              </button>
            ))}

            {!customerSearching &&
              customerSearch.trim().length >= 2 &&
              customerResults.length === 0 &&
              !customerSearchError && (
                <p className="text-center text-xs text-nx-ink-3 py-2">
                  {t("operationsCalendar.clickToBook.customer.noResults")}
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
