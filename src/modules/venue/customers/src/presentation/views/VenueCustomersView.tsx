"use client";

import React from "react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
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
    loading,
    error,
    createOpen,
    setCreateOpen,
    newName,
    setNewName,
    newType,
    setNewType,
    createLoading,
    createError,
    handleSearch,
    handleResetSearch,
    handleCreateCustomer,
  } = useVenueCustomersViewModel();

  // All visible copy comes from the registered EN/AR customer locale module.
  const tr = (key: string, _enFallback: string, _arFallback: string) => t(key);

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-customers-view">
      <PageHeader
        icon={Users}
        title={tr("venueCustomers.title", "Customers", "العملاء")}
        description={tr(
          "venueCustomers.description",
          "View and manage venue customers, contact details, and bookings.",
          "عرض وإدارة عملاء المنشأة وبيانات الاتصال وسجل الحجوزات."
        )}
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
            <UserPlus className="size-4" />
            <span>{tr("venueCustomers.newCustomer", "+ New Customer", "+ عميل جديد")}</span>
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
                      ? tr("venueCustomers.types.organization", "Organization", "مؤسسة / شركة")
                      : tr("venueCustomers.types.individual", "Individual", "فرد")}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="gap-1.5 font-semibold">
                  <Link href={`/venue/calendar?newBooking=true&customerId=${encodeURIComponent(selectedCustomer.id)}`}>
                    <CalendarDays className="size-4" />
                    <span>{tr("venueCustomers.bookForCustomer", "Book for Customer", "حجز جديد للعميل")}</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  {tr("venueCustomers.dismiss", "Dismiss", "إلغاء التحديد")}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-nx-ink-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr(
              "venueCustomers.search.placeholder",
              "Search customers by name, phone or email...",
              "البحث عن عميل بالاسم أو رقم الهاتف..."
            )}
            className="ps-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          {tr("venueCustomers.search.submit", "Search", "بحث")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleResetSearch}
          aria-label={tr("venueCustomers.search.reset", "Reset", "إعادة تعيين")}
        >
          <RefreshCw className="size-4" />
        </Button>
      </form>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{tr("venueCustomers.errors.loadFailed", "Error loading customers", "خطأ في تحميل العملاء")}</AlertTitle>
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
          title={tr("venueCustomers.empty.title", "No customers found", "لم يتم العثور على عملاء")}
          description={
            searchQuery
              ? tr(
                  "venueCustomers.empty.searchDescription",
                  "No customers matched your search query.",
                  "لا توجد نتائج مطابقة لبحثك. جرب كلمة بحث أخرى."
                )
              : tr(
                  "venueCustomers.empty.defaultDescription",
                  "Get started by adding your first venue customer to take bookings.",
                  "ابدأ بإضافة أول عميل إلى منشأتك لتسجيل الحجوزات."
                )
          }
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
              <UserPlus className="size-4" />
              <span>{tr("venueCustomers.empty.action", "Add Customer", "إضافة عميل")}</span>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => {
            const isSelected = selectedCustomer?.id === c.id;
            return (
              <Card
                key={c.id}
                className={`transition-colors cursor-pointer hover:border-nx-accent/50 ${
                  isSelected ? "border-nx-accent ring-1 ring-nx-accent" : ""
                }`}
                onClick={() => setSelectedCustomer(c)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-nx-surfaceSubtle text-nx-ink-2">
                      {c.type === "Organization" ? (
                        <Building className="size-4" />
                      ) : (
                        <User className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-nx-ink truncate">
                        {c.displayName}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {c.type === "Organization"
                          ? tr("venueCustomers.types.organization", "Organization", "مؤسسة")
                          : tr("venueCustomers.types.person", "Person", "فرد")}
                      </Badge>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="ghost" className="shrink-0 text-xs text-nx-accent">
                    <Link
                      href={`/venue/calendar?newBooking=true&customerId=${encodeURIComponent(c.id)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarDays className="size-3.5 me-1" />
                      {tr("venueCustomers.actions.book", "Book", "حجز")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreateCustomer}>
            <DialogHeader>
              <DialogTitle>{tr("venueCustomers.dialog.title", "Add New Customer", "إضافة عميل جديد")}</DialogTitle>
              <DialogDescription>
                {tr(
                  "venueCustomers.dialog.description",
                  "Enter the customer details to add them to your venue directory.",
                  "أدخل اسم العميل لإضافته إلى قائمة عملاء المنشأة."
                )}
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
                <Label htmlFor="customer-name">{tr("venueCustomers.dialog.customerName", "Customer Name", "اسم العميل")}</Label>
                <Input
                  id="customer-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={tr("venueCustomers.dialog.namePlaceholder", "e.g. John Doe", "مثال: أحمد محمد")}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-type">{tr("venueCustomers.dialog.customerType", "Customer Type", "نوع العميل")}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newType === "Person" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewType("Person")}
                    className="flex-1"
                  >
                    <User className="size-3.5 me-1.5" />
                    {tr("venueCustomers.types.individual", "Individual", "فرد")}
                  </Button>
                  <Button
                    type="button"
                    variant={newType === "Organization" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewType("Organization")}
                    className="flex-1"
                  >
                    <Building className="size-3.5 me-1.5" />
                    {tr("venueCustomers.types.organization", "Organization", "مؤسسة")}
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
                {tr("venueCustomers.actions.cancel", "Cancel", "إلغاء")}
              </Button>
              <Button type="submit" disabled={createLoading || !newName.trim()}>
                {createLoading
                  ? tr("venueCustomers.actions.saving", "Saving...", "جارٍ الحفظ...")
                  : tr("venueCustomers.actions.addCustomer", "Add Customer", "إضافة العميل")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
