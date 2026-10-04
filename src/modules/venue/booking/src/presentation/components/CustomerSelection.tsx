"use client";

import { useState } from "react";
import { Check, Search, UserPlus, UserRound, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import type { CustomerSummary } from "../../domain/entities/Booking";

interface CustomerSelectionProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  canViewCustomers: boolean;
  customer: CustomerSummary | null;
  results: CustomerSummary[];
  searching: boolean;
  onSearch: (query: string) => Promise<CustomerSummary[]>;
  onSelect: (id: string) => Promise<CustomerSummary>;
  onCreateCustomer?: (name: string, type?: "Person" | "Organization") => Promise<CustomerSummary>;
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
  onCreateCustomer,
  onClear,
}: CustomerSelectionProps) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"Person" | "Organization">("Person");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSearch(query);
    setSearched(true);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim() || !onCreateCustomer) return;
    setCreating(true);
    setCreateError(null);
    try {
      await onCreateCustomer(newName.trim(), newType);
      setIsCreateOpen(false);
      setNewName("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-nx-accent" aria-hidden="true" />
            {t("booking.customer.title")}
          </CardTitle>
          <p className="mt-1 text-sm text-nx-ink-2">{t("booking.customer.description")}</p>
        </div>
        {canViewCustomers && !customer && onCreateCustomer && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5">
                <UserPlus className="size-4" aria-hidden="true" />
                {t("booking.customer.quickCreate")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("booking.customer.quickCreate")}</DialogTitle>
                <DialogDescription>{t("booking.customer.quickCreateDescription")}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                {createError && (
                  <Alert variant="destructive">
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="quick-customer-name">{t("booking.customer.nameLabel")}</Label>
                  <Input
                    id="quick-customer-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t("booking.customer.namePlaceholder")}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-customer-type">{t("booking.customer.typeLabel")}</Label>
                  <Select value={newType} onValueChange={(val) => setNewType(val as "Person" | "Organization")}>
                    <SelectTrigger id="quick-customer-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Person">{t("booking.customer.person")}</SelectItem>
                      <SelectItem value="Organization">{t("booking.customer.organization")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    {t("booking.customer.cancel")}
                  </Button>
                  <Button type="submit" disabled={!newName.trim() || creating}>
                    {creating ? t("booking.customer.creating") : t("booking.customer.createAction")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
              <ul className="divide-y divide-nx-border rounded-xl border border-nx-border list-none p-0 m-0" role="list">
                {results.map((party) => (
                  <li key={party.id} role="listitem">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex w-full h-auto items-center justify-between gap-3 p-3 text-start font-normal rounded-none first:rounded-t-xl last:rounded-b-xl hover:bg-nx-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nx-accent"
                      onClick={() => void onSelect(party.id)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-nx-ink">{party.displayName}</span>
                        <span className="block text-xs text-nx-ink-3">{party.type}</span>
                      </span>
                      <Check className="size-4 shrink-0 text-nx-accent" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {searched && !searching && results.length === 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-dashed border-nx-border p-4 bg-nx-surface-2">
                <p className="text-sm text-nx-ink-2">{t("booking.customer.noResults")}</p>
                {onCreateCustomer && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={() => {
                      setNewName(query);
                      setIsCreateOpen(true);
                    }}
                  >
                    <UserPlus className="size-4" aria-hidden="true" />
                    {t("booking.customer.quickCreate")}
                  </Button>
                )}
              </div>
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
