"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  UserPlus,
  CalendarDays,
  User,
  Building,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import {
  DetailSheet,
  DetailSheetHeader,
  DetailSheetBody,
  DetailSheetFooter,
} from "@core/ui/detail-sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useVenueCustomersViewModel } from "../viewmodels/useVenueCustomersViewModel";

export function VenueCustomersView() {
  const {
    t,
    direction,
    searchQuery,
    setSearchQuery,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    detailDrawerOpen,
    setDetailDrawerOpen,
    customerBookings,
    customerBookingsLoading,
    customerBookingsError,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    createOpen,
    setCreateOpen,
    newName,
    setNewName,
    newPhone,
    setNewPhone,
    newType,
    setNewType,
    createLoading,
    createError,
    handleSearch,
    handleResetSearch,
    handleCreateCustomer,
  } = useVenueCustomersViewModel();

  useModuleLocales(() => import("../../../locales"), "venue.customers");
  const isRtl = direction === "rtl";

  const [copiedId, setCopiedId] = useState(false);

  const handleCopyPartyId = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("confirm")) {
      return (
        <Badge variant="outline" className="border-nx-accent/40 bg-nx-accent/15 text-xs font-semibold text-nx-ink">
          {status}
        </Badge>
      );
    }
    if (s.includes("check")) {
      return (
        <Badge variant="outline" className="border-nx-line text-xs font-semibold text-nx-ink-2">
          {status}
        </Badge>
      );
    }
    if (s.includes("complete")) {
      return (
        <Badge variant="outline" className="border-nx-line text-xs font-semibold text-nx-ink-2">
          {status}
        </Badge>
      );
    }
    if (s.includes("cancel")) {
      return (
        <Badge variant="destructive" className="text-xs font-semibold">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-nx-line text-xs font-semibold text-nx-ink-3">
        {status}
      </Badge>
    );
  };

  const formatUtcDate = (utcString: string) => {
    if (!utcString) return "";
    try {
      const d = new Date(utcString);
      return d.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return utcString;
    }
  };

  // Pagination display math
  const startItem = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-customers-view">
      <PageHeader
        icon={Users}
        title={
          <span className="flex items-center gap-2.5">
            <span>{t("venueCustomers.title")}</span>
            {totalCount > 0 && (
              <Badge variant="outline" className="border-nx-line text-xs font-semibold text-nx-ink-2">
                {totalCount}
              </Badge>
            )}
          </span>
        }
        description={t("venueCustomers.description")}
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
            <UserPlus className="size-4" />
            <span>{t("venueCustomers.newCustomer")}</span>
          </Button>
        }
      />

      {/* Selected / Spotlight Customer Banner if navigated from Booking 360 */}
      {selectedCustomer && (
        <Card className="border-nx-accent/30 bg-nx-accent/5">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-nx-accent/10 text-nx-accent">
                  {selectedCustomer.type === "Organization" ? (
                    <Building className="size-5" />
                  ) : (
                    <User className="size-5" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-nx-ink">
                    {selectedCustomer.displayName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedCustomer.type === "Organization"
                      ? t("venueCustomers.types.organization")
                      : t("venueCustomers.types.individual")}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="gap-1.5 font-semibold">
                  <Link
                    href={`/venue/calendar?newBooking=true&customerPartyId=${encodeURIComponent(
                      selectedCustomer.id
                    )}`}
                  >
                    <CalendarDays className="size-4" />
                    <span>
                      {t("venueCustomers.bookForCustomer")}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailDrawerOpen(true)}
                >
                  {t("venueCustomers.actions.viewDetails")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                  {t("venueCustomers.dismiss")}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Search Bar with Debounced Live Search and Clear button */}
      <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-nx-ink-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("venueCustomers.search.placeholder")}
            className="pe-8 ps-9"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleResetSearch}
              className="absolute end-2.5 top-1/2 h-auto w-auto -translate-y-1/2 p-0 text-nx-ink-3 hover:bg-transparent hover:text-nx-ink"
              aria-label={t("venueCustomers.search.clear")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <Button type="submit" variant="secondary">
          {t("venueCustomers.search.submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleResetSearch}
          aria-label={t("venueCustomers.search.reset")}
        >
          <RefreshCw className="size-4" />
        </Button>
      </form>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>
            {t("venueCustomers.errors.loadFailed")}
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner showText={false} />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("venueCustomers.empty.title")}
          description={
            searchQuery
              ? t("venueCustomers.empty.searchDescription")
              : t("venueCustomers.empty.defaultDescription")
          }
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
              <UserPlus className="size-4" />
              <span>{t("venueCustomers.empty.action")}</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              return (
                <Card
                  key={c.id}
                  className={`cursor-pointer transition-colors hover:border-nx-line-hi ${
                    isSelected ? "border-nx-accent ring-1 ring-nx-accent" : "border-nx-line"
                  }`}
                  onClick={() => setSelectedCustomer(c)}
                >
                  <CardContent className="flex flex-col justify-between gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-nx-raised text-nx-ink-2">
                          {c.type === "Organization" ? (
                            <Building className="size-4" />
                          ) : (
                            <User className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-nx-ink">
                            {c.displayName}
                          </p>
                          <Badge variant="outline" className="mt-0.5 border-nx-line text-[10px] text-nx-ink-3">
                            {c.type === "Organization"
                              ? t("venueCustomers.types.organization")
                              : t("venueCustomers.types.person")}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-xs text-nx-accent"
                      >
                        <Link
                          href={`/venue/calendar?newBooking=true&customerPartyId=${encodeURIComponent(
                            c.id
                          )}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarDays className="me-1 size-3.5" />
                          {t("venueCustomers.actions.book")}
                        </Link>
                      </Button>
                    </div>

                    {/* Contact points display on cards */}
                    <div className="space-y-1 border-t border-nx-line pt-2 text-xs text-nx-ink-2">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="size-3 text-nx-ink-3" />
                          <span dir="ltr">{c.phone}</span>
                        </div>
                      ) : null}
                      {c.email ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="size-3 text-nx-ink-3" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      ) : null}
                      {!c.phone && !c.email && (
                        <span className="text-nx-ink-3">
                          {t("venueCustomers.contact.noPhone")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-nx-line pt-4">
              <p className="text-xs text-nx-ink-2">
                <span>{t("venueCustomers.pagination.showing")}</span>{" "}
                <span className="font-semibold text-nx-ink">{startItem}</span>{" "}
                <span>{t("venueCustomers.pagination.to")}</span>{" "}
                <span className="font-semibold text-nx-ink">{endItem}</span>{" "}
                <span>{t("venueCustomers.pagination.of")}</span>{" "}
                <span className="font-semibold text-nx-ink">{totalCount}</span>{" "}
                <span>{t("venueCustomers.pagination.customersCount")}</span>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!hasPreviousPage || loading}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="size-3.5 rtl:rotate-180" />
                  <span>{t("venueCustomers.pagination.previous")}</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`size-8 p-0 text-xs ${
                          isActive ? "font-bold" : "text-nx-ink-2"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-1 text-xs text-nx-ink-3">... {totalPages}</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasNextPage || loading}
                  className="gap-1 text-xs"
                >
                  <span>{t("venueCustomers.pagination.next")}</span>
                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Detail Drawer / Side Sheet */}
      <DetailSheet
        open={detailDrawerOpen && selectedCustomer !== null}
        onOpenChange={setDetailDrawerOpen}
        title={selectedCustomer?.displayName ?? "Customer Detail"}
        description={t("venueCustomers.drawer.description")}
        width="lg"
      >
        {selectedCustomer && (
          <>
            <DetailSheetHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-nx-accent/10 text-nx-accent">
                  {selectedCustomer.type === "Organization" ? (
                    <Building className="size-5" />
                  ) : (
                    <User className="size-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-nx-ink">
                    {selectedCustomer.displayName}
                  </h2>
                  <Badge variant="outline" className="mt-0.5 border-nx-line text-xs font-semibold text-nx-ink-2">
                    {selectedCustomer.type === "Organization"
                      ? t("venueCustomers.types.organization")
                      : t("venueCustomers.types.individual")}
                  </Badge>
                </div>
              </div>
            </DetailSheetHeader>

            <DetailSheetBody className="space-y-6 p-6">
              {/* Contact Information & Party ID */}
              <div className="space-y-3 rounded-lg border border-nx-line bg-nx-surface p-4">
                <h3 className="text-sm font-semibold text-nx-ink">
                  {t("venueCustomers.contact.title")}
                </h3>

                <div className="space-y-2 text-xs">
                  {/* Party Kernel ID with copy button */}
                  <div className="flex items-center justify-between gap-2 rounded bg-nx-raised p-2 font-mono">
                    <div className="min-w-0">
                      <span className="text-nx-ink-3">
                        {t("venueCustomers.contact.partyId")}:
                      </span>{" "}
                      <span className="font-semibold text-nx-ink">{selectedCustomer.id}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyPartyId(selectedCustomer.id)}
                      className="h-6 gap-1 px-2 text-[10px]"
                    >
                      {copiedId ? (
                        <>
                          <Check className="size-3 text-nx-accent" />
                          <span>{t("venueCustomers.contact.copiedPartyId")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 text-nx-ink-3" />
                          <span>{t("venueCustomers.contact.copyPartyId")}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 pt-1 text-nx-ink-2">
                    <Phone className="size-3.5 text-nx-ink-3" />
                    <span className="text-nx-ink-3">
                      {t("venueCustomers.contact.phone")}:
                    </span>
                    {selectedCustomer.phone ? (
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="font-medium text-nx-accent hover:underline"
                        dir="ltr"
                      >
                        {selectedCustomer.phone}
                      </a>
                    ) : (
                      <span className="text-nx-ink-3">
                        {t("venueCustomers.contact.noPhone")}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-nx-ink-2">
                    <Mail className="size-3.5 text-nx-ink-3" />
                    <span className="text-nx-ink-3">
                      {t("venueCustomers.contact.email")}:
                    </span>
                    {selectedCustomer.email ? (
                      <a
                        href={`mailto:${selectedCustomer.email}`}
                        className="font-medium text-nx-accent hover:underline"
                      >
                        {selectedCustomer.email}
                      </a>
                    ) : (
                      <span className="text-nx-ink-3">
                        {t("venueCustomers.contact.noEmail")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="rounded-lg border border-nx-line bg-nx-surface p-4">
                <Button asChild className="w-full gap-2 font-bold">
                  <Link
                    href={`/venue/calendar?newBooking=true&customerPartyId=${encodeURIComponent(
                      selectedCustomer.id
                    )}`}
                  >
                    <CalendarDays className="size-4" />
                    <span>
                      {t("venueCustomers.bookForCustomerCTA")}
                    </span>
                  </Link>
                </Button>
              </div>

              {/* Customer Booking History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-nx-ink">
                    {t("venueCustomers.bookingHistory.title")}
                  </h3>
                  {customerBookings.length > 0 && (
                    <Badge variant="outline" className="border-nx-line text-xs font-semibold text-nx-ink-2">
                      {customerBookings.length}
                    </Badge>
                  )}
                </div>

                {customerBookingsLoading ? (
                  <div className="py-6">
                    <LoadingSpinner showText={false} />
                  </div>
                ) : customerBookingsError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{customerBookingsError}</AlertDescription>
                  </Alert>
                ) : customerBookings.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-nx-line p-6 text-center">
                    <p className="text-xs text-nx-ink-3">
                      {t("venueCustomers.bookingHistory.noBookings")}
                    </p>
                    <Button asChild size="sm" variant="ghost" className="mt-2 text-xs text-nx-accent">
                      <Link
                        href={`/venue/calendar?newBooking=true&customerPartyId=${encodeURIComponent(
                          selectedCustomer.id
                        )}`}
                      >
                        {t("venueCustomers.bookingHistory.createFirstBooking")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerBookings.map((res) => (
                      <div
                        key={res.id}
                        className="flex flex-col gap-2 rounded-lg border border-nx-line bg-nx-surface p-3 transition-colors hover:border-nx-line-hi sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-nx-ink">
                              {res.reservationNumber}
                            </span>
                            {getStatusBadge(res.status)}
                          </div>
                          <p className="text-[11px] text-nx-ink-2">
                            {formatUtcDate(res.requestedStartUtc)}
                          </p>
                        </div>

                        <Button asChild size="sm" variant="outline" className="gap-1 text-xs">
                          <Link href={`/venue/bookings/${encodeURIComponent(res.id)}`}>
                            <span>
                              {t("venueCustomers.bookingHistory.viewBooking360")}
                            </span>
                            <ExternalLink className="size-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DetailSheetBody>

            <DetailSheetFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailDrawerOpen(false)}
              >
                {t("venueCustomers.actions.cancel")}
              </Button>
            </DetailSheetFooter>
          </>
        )}
      </DetailSheet>

      {/* Create Customer Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreateCustomer}>
            <DialogHeader>
              <DialogTitle>
                {t("venueCustomers.dialog.title")}
              </DialogTitle>
              <DialogDescription>
                {t("venueCustomers.dialog.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {createError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="customer-name">
                  {t("venueCustomers.dialog.customerName")}
                </Label>
                <Input
                  id="customer-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("venueCustomers.dialog.namePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-phone">
                  {t("venueCustomers.dialog.customerPhone")}
                </Label>
                <Input
                  id="customer-phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder={t("venueCustomers.dialog.phonePlaceholder")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-type">
                  {t("venueCustomers.dialog.customerType")}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newType === "Person" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewType("Person")}
                    className="flex-1"
                  >
                    <User className="me-1.5 size-3.5" />
                    {t("venueCustomers.types.individual")}
                  </Button>
                  <Button
                    type="button"
                    variant={newType === "Organization" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewType("Organization")}
                    className="flex-1"
                  >
                    <Building className="me-1.5 size-3.5" />
                    {t("venueCustomers.types.organization")}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
              >
                {t("venueCustomers.actions.cancel")}
              </Button>
              <Button type="submit" disabled={createLoading || !newName.trim()}>
                {createLoading
                  ? t("venueCustomers.actions.saving")
                  : t("venueCustomers.actions.addCustomer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
