"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  UserPlus,
  CalendarDays,
  User,
  Building,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
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
import { useI18n } from "@core/providers/i18n-provider";
import { getVenueContainer } from "@modules/venue/di";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";
import { mapVenueError } from "@modules/venue/shared/src/utils/venueErrorMapper";

export function VenueCustomersView() {
  const { t, language, direction } = useI18n();
  const isRtl = language === "ar";
  const searchParams = useSearchParams();
  const partyIdParam = searchParams.get("partyId");

  const { customerRepository } = useMemo(() => getVenueContainer(), []);

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Customer Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"Person" | "Organization">("Person");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchCustomers = useCallback(
    async (query = "") => {
      setLoading(true);
      setError(null);
      try {
        const results = await customerRepository.search(query);
        setCustomers(results);

        if (partyIdParam && !selectedCustomer) {
          const match = results.find((c) => c.id === partyIdParam);
          if (match) {
            setSelectedCustomer(match);
          } else {
            try {
              const direct = await customerRepository.getById(partyIdParam);
              setSelectedCustomer(direct);
            } catch {
              // Ignore direct fetch failure
            }
          }
        }
      } catch (err) {
        setError(mapVenueError(err, language).message);
      } finally {
        setLoading(false);
      }
    },
    [customerRepository, language, partyIdParam, selectedCustomer]
  );

  useEffect(() => {
    void fetchCustomers("");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchCustomers(searchQuery);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const created = await customerRepository.create(newName.trim(), newType);
      setCreateOpen(false);
      setNewName("");
      setSelectedCustomer(created);
      await fetchCustomers(searchQuery);
    } catch (err) {
      setCreateError(mapVenueError(err, language).message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-customers-view">
      <PageHeader
        icon={Users}
        title={isRtl ? "العملاء" : "Customers"}
        description={
          isRtl
            ? "عرض وإدارة عملاء المنشأة وبيانات الاتصال وسجل الحجوزات."
            : "View and manage venue customers, contact details, and bookings."
        }
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
            <UserPlus className="size-4" />
            <span>{isRtl ? "+ عميل جديد" : "+ New Customer"}</span>
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
                      ? isRtl
                        ? "مؤسسة / شركة"
                        : "Organization"
                      : isRtl
                      ? "فرد"
                      : "Individual"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="gap-1.5 font-semibold">
                  <Link href={`/venue/calendar?newBooking=true&customerId=${encodeURIComponent(selectedCustomer.id)}`}>
                    <CalendarDays className="size-4" />
                    <span>{isRtl ? "حجز جديد للعميل" : "Book for Customer"}</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  {isRtl ? "إلغاء التحديد" : "Dismiss"}
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
            placeholder={
              isRtl
                ? "البحث عن عميل بالاسم أو رقم الهاتف..."
                : "Search customers by name, phone or email..."
            }
            className="ps-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          {isRtl ? "بحث" : "Search"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            setSearchQuery("");
            void fetchCustomers("");
          }}
          aria-label={isRtl ? "إعادة تعيين" : "Reset"}
        >
          <RefreshCw className="size-4" />
        </Button>
      </form>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{isRtl ? "خطأ في تحميل العملاء" : "Error loading customers"}</AlertTitle>
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
          title={isRtl ? "لم يتم العثور على عملاء" : "No customers found"}
          description={
            searchQuery
              ? isRtl
                ? "لا توجد نتائج مطابقة لبحثك. جرب كلمة بحث أخرى."
                : "No customers matched your search query."
              : isRtl
              ? "ابدأ بإضافة أول عميل إلى منشأتك لتسجيل الحجوزات."
              : "Get started by adding your first venue customer to take bookings."
          }
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5 font-bold">
              <UserPlus className="size-4" />
              <span>{isRtl ? "إضافة عميل" : "Add Customer"}</span>
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
                          ? isRtl
                            ? "مؤسسة"
                            : "Organization"
                          : isRtl
                          ? "فرد"
                          : "Person"}
                      </Badge>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="ghost" className="shrink-0 text-xs text-nx-accent">
                    <Link
                      href={`/venue/calendar?newBooking=true&customerId=${encodeURIComponent(c.id)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarDays className="size-3.5 me-1" />
                      {isRtl ? "حجز" : "Book"}
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
              <DialogTitle>{isRtl ? "إضافة عميل جديد" : "Add New Customer"}</DialogTitle>
              <DialogDescription>
                {isRtl
                  ? "أدخل اسم العميل لإضافته إلى قائمة عملاء المنشأة."
                  : "Enter the customer details to add them to your venue directory."}
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
                <Label htmlFor="customer-name">{isRtl ? "اسم العميل" : "Customer Name"}</Label>
                <Input
                  id="customer-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={isRtl ? "مثال: أحمد محمد" : "e.g. John Doe"}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-type">{isRtl ? "نوع العميل" : "Customer Type"}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newType === "Person" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewType("Person")}
                    className="flex-1"
                  >
                    <User className="size-3.5 me-1.5" />
                    {isRtl ? "فرد" : "Individual"}
                  </Button>
                  <Button
                    type="button"
                    variant={newType === "Organization" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewType("Organization")}
                    className="flex-1"
                  >
                    <Building className="size-3.5 me-1.5" />
                    {isRtl ? "مؤسسة" : "Organization"}
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
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={createLoading || !newName.trim()}>
                {createLoading
                  ? isRtl
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : isRtl
                  ? "إضافة العميل"
                  : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
