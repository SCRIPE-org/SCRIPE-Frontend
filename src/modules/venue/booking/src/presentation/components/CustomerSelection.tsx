"use client";

import { useState } from "react";
import { Check, Search, UserRound, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { CustomerSummary } from "../../domain/entities/Booking";

interface CustomerSelectionProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  canViewCustomers: boolean;
  customer: CustomerSummary | null;
  results: CustomerSummary[];
  searching: boolean;
  onSearch: (query: string) => Promise<CustomerSummary[]>;
  onSelect: (id: string) => Promise<CustomerSummary>;
  onClear: () => void;
}

export function CustomerSelection({
  t,
  canViewCustomers,
  customer,
  results,
  searching,
  onSearch,
  onSelect,
  onClear,
}: CustomerSelectionProps) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSearch(query);
    setSearched(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-5 text-nx-accent" aria-hidden="true" />
          {t("booking.customer.title")}
        </CardTitle>
        <p className="text-sm text-nx-ink-2">{t("booking.customer.description")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canViewCustomers ? (
          <Alert variant="warning">
            <AlertTitle>{t("booking.customer.permissionTitle")}</AlertTitle>
            <AlertDescription>{t("booking.customer.permissionDescription")}</AlertDescription>
          </Alert>
        ) : customer ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-nx-border bg-nx-surface-2 p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">
                {t("booking.customer.selected")}
              </p>
              <p className="truncate font-semibold text-nx-ink">{customer.displayName}</p>
              <Badge variant="outline" className="mt-2">{customer.type}</Badge>
            </div>
            <Button type="button" variant="outline" onClick={onClear}>
              <X className="size-4" aria-hidden="true" />
              {t("booking.customer.clear")}
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="booking-customer-search">{t("booking.customer.searchLabel")}</Label>
                <Input
                  id="booking-customer-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("booking.customer.searchPlaceholder")}
                />
              </div>
              <Button type="submit" disabled={searching}>
                <Search className="size-4" aria-hidden="true" />
                {searching ? t("booking.customer.searching") : t("booking.customer.searchAction")}
              </Button>
            </form>

            {results.length > 0 && (
              <div className="divide-y divide-nx-border rounded-xl border border-nx-border" role="list">
                {results.map((party) => (
                  <button
                    key={party.id}
                    type="button"
                    role="listitem"
                    className="flex w-full items-center justify-between gap-3 p-3 text-start hover:bg-nx-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nx-accent"
                    onClick={() => void onSelect(party.id)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-nx-ink">{party.displayName}</span>
                      <span className="block text-xs text-nx-ink-3">{party.type}</span>
                    </span>
                    <Check className="size-4 shrink-0 text-nx-accent" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}

            {searched && !searching && results.length === 0 && (
              <p className="text-sm text-nx-ink-2">{t("booking.customer.noResults")}</p>
            )}
          </>
        )}

        <div className="space-y-1 text-xs text-nx-ink-3">
          <p>{t("booking.customer.contactLimitation")}</p>
          <p>{t("booking.customer.existingOnly")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
