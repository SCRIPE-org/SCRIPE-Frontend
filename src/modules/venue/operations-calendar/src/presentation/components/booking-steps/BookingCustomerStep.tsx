"use client";

import { Search, UserPlus } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { CustomerSummary } from "@modules/venue";

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

const AVATAR_PALETTE = [
  "border-primary/20 bg-primary/10 text-primary",
  "border-info/20 bg-info/10 text-info",
  "border-success/20 bg-success/10 text-success",
  "border-warning/20 bg-warning/10 text-warning",
  "border-nx-line bg-nx-raised text-nx-ink",
];

/**
 * Step 1 customer search and inline quick-add workflow for Click-to-Book.
 */
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
          className="inline-flex h-auto items-center gap-1 px-0 text-xs font-semibold text-nx-accent hover:underline"
        >
          <UserPlus className="size-3" aria-hidden="true" />
          <span>
            {quickAddOpen
              ? t("operationsCalendar.clickToBook.customer.searchExisting")
              : t("operationsCalendar.clickToBook.customer.addNew")}
          </span>
        </Button>
      </div>

      {quickAddOpen ? (
        <div className="space-y-2.5 rounded-nx-lg border border-nx-line bg-nx-raised/40 p-3.5">
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
            variant="default"
            size="sm"
            onClick={onQuickAddCustomer}
            disabled={!quickName.trim() || submitting}
            className="h-8 w-full text-xs font-bold"
          >
            {submitting
              ? t("operationsCalendar.clickToBook.customer.creating")
              : t("operationsCalendar.clickToBook.customer.createAndSelect")}
          </Button>
        </div>
      ) : selectedCustomer ? (
        <div className="flex items-center justify-between rounded-nx-lg border border-nx-accent/40 bg-nx-accent-wash p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-nx-accent-fill text-xs font-bold text-nx-on-fill">
              {selectedCustomer.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-nx-ink">{selectedCustomer.displayName}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedCustomer.type || t("operationsCalendar.clickToBook.customer.defaultType")}
                </Badge>
              </div>
              <p className="text-[10px] text-nx-ink-2">
                {selectedCustomer.phone ||
                  t("operationsCalendar.clickToBook.customer.activeCustomer")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectCustomer(null)}
            className="h-7 text-xs font-semibold text-nx-accent hover:underline"
          >
            {t("operationsCalendar.clickToBook.customer.change")}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search
              className="absolute start-2.5 top-2.5 size-3.5 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              placeholder={t("operationsCalendar.clickToBook.customer.searchPlaceholder")}
              value={customerSearch}
              onChange={(e) => onCustomerSearchChange(e.target.value)}
              className="h-8 rounded-nx-control ps-8 text-xs"
            />
          </div>

          {customerSearching && (
            <div className="flex items-center justify-center gap-2 p-2 text-center text-xs text-nx-ink-3">
              <LoadingSpinner size="inline" className="text-nx-accent" />
              <span>{t("operationsCalendar.clickToBook.customer.searching")}</span>
            </div>
          )}

          {customerSearchError && (
            <Alert variant="destructive" className="py-1 text-xs">
              <AlertDescription>
                {t("operationsCalendar.clickToBook.customer.searchError")}
              </AlertDescription>
            </Alert>
          )}

          {!customerSearching &&
            !customerSearchError &&
            customerSearch.trim().length >= 2 &&
            customerResults.length === 0 && (
              <div className="rounded-nx-lg border border-nx-line bg-nx-raised/30 p-4 text-center">
                <p className="text-xs font-semibold text-nx-ink">
                  {t("operationsCalendar.clickToBook.customer.noResultsFound")}
                </p>
                <p className="mt-1 text-[11px] text-nx-ink-3">
                  {t("operationsCalendar.clickToBook.customer.noResultsHint")}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onToggleQuickAdd}
                  className="mt-2 gap-1 text-xs font-bold text-nx-accent hover:underline"
                >
                  <UserPlus className="size-3" aria-hidden="true" />
                  <span>{t("operationsCalendar.clickToBook.customer.addNew")}</span>
                </Button>
              </div>
            )}

          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {customerResults.map((cust, idx) => {
              const colorClass = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
              return (
                <Button
                  variant="ghost"
                  type="button"
                  key={cust.id}
                  onClick={() => {
                    onSelectCustomer(cust);
                    onAdvanceToPricing();
                  }}
                  className="group h-auto w-full justify-between rounded-nx-lg border border-nx-line p-2.5 text-start text-xs transition-colors hover:border-nx-accent/40 hover:bg-nx-raised/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full border text-xs font-bold ${colorClass}`}
                    >
                      {cust.displayName.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-semibold text-nx-ink group-hover:text-nx-accent">
                        {cust.displayName}
                      </span>
                      <span className="block text-[10px] text-nx-ink-3">
                        {cust.phone ||
                          cust.type ||
                          t("operationsCalendar.clickToBook.customer.defaultType")}
                      </span>
                    </div>
                  </div>
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full border border-nx-line group-hover:border-nx-accent">
                    <div className="size-2 rounded-full bg-transparent group-hover:bg-nx-accent-fill" />
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
