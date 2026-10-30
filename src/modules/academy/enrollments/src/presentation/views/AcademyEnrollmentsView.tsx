"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { ACADEMY_PERMISSIONS } from "@modules/academy/shared";
import { useAcademyServiceLocator } from "@modules/academy/di";
import { useAcademyEnrollmentsViewModel } from "../viewmodels/useAcademyEnrollmentsViewModel";
import type { AcademyEnrollment, EnrollmentStatus, BillingStatus } from "../../domain/entities/AcademyEnrollment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Badge } from "@core/ui/badge";
import {
  GraduationCap,
  CreditCard,
  Receipt,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  Plus,
  ShieldAlert,
  Send,
  X
} from "lucide-react";

export function AcademyEnrollmentsView() {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const isAr = language === "ar";

  const canView = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_VIEW);
  const canCreate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_CREATE);
  const canUpdate = usePermission(ACADEMY_PERMISSIONS.ACADEMY_ENROLLMENTS_UPDATE);

  const locator = useAcademyServiceLocator();
  const vm = useAcademyEnrollmentsViewModel(locator.enrollmentsRepository);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [targetEnrollment, setTargetEnrollment] = useState<AcademyEnrollment | null>(null);

  // Form Fields
  const [athleteId, setAthleteId] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [priceAmount, setPriceAmount] = useState<number>(1250);
  const [priceCurrency, setPriceCurrency] = useState("SAR");
  const [catalogPriceId, setCatalogPriceId] = useState("");
  const [notes, setNotes] = useState("");
  const [financeNotes, setFinanceNotes] = useState("");

  const handleCreateSubmit = async () => {
    if (!athleteId || !offeringId || priceAmount <= 0) return;
    try {
      await vm.createEnrollment({
        athleteId,
        offeringId,
        priceAmount,
        priceCurrency,
        catalogPriceId: catalogPriceId || null,
        notes: notes || null
      });
      setShowCreateModal(false);
      setAthleteId("");
      setOfferingId("");
      setNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  const handleFinanceSubmit = async () => {
    if (!targetEnrollment) return;
    try {
      await vm.handoffToFinance(targetEnrollment.id, {
        notes: financeNotes || null
      });
      setShowFinanceModal(false);
      setTargetEnrollment(null);
      setFinanceNotes("");
    } catch {
      // Handled in viewmodel
    }
  };

  if (!canView) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{isAr ? "غير مصرح" : "Unauthorized"}</AlertTitle>
          <AlertDescription>
            {isAr
              ? "ليس لديك صلاحية لعرض سجلات التسجيل وإدارة السعة المالية للأكاديمية."
              : "You do not have permission to view Academy enrollments and capacity management."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-600 text-white">{isAr ? "نشط" : "Active"}</Badge>;
      case "PendingFinance":
        return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50">{isAr ? "في انتظار السداد" : "Pending Finance"}</Badge>;
      case "Completed":
        return <Badge variant="secondary">{isAr ? "مكتمل" : "Completed"}</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">{isAr ? "ملغي" : "Cancelled"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingBadge = (bStatus: BillingStatus) => {
    switch (bStatus) {
      case "Invoiced":
        return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50/50">{isAr ? "تم إصدار فاتورة" : "Invoiced"}</Badge>;
      case "Paid":
        return <Badge className="bg-emerald-600 text-white">{isAr ? "مدفوع" : "Paid"}</Badge>;
      case "Overdue":
        return <Badge variant="destructive">{isAr ? "متأخر السداد" : "Overdue"}</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">{isAr ? "غير مفوتر" : "Unbilled"}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/academy" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              {isAr ? "لوحة الأكاديمية" : "Academy Overview"}
            </Link>
            <span>/</span>
            <span>{isAr ? "التسجيل والسعة والمالية" : "Enrollments & Finance"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAr ? "التسجيل المحكوم والسعة والربط المالي" : "Governed Enrollments & Finance Handoff"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? "حجز المقاعد الذري لمنع التجاوز، واللقطة السعرية غير القابلة للتعديل، والتسليم الآمن لنظام الفواتير المالي."
              : "Atomic capacity reservation, immutable pricing snapshot, and idempotent asynchronous Finance billing handoff."}
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isAr ? "تسجيل جديد" : "New Enrollment"}
          </Button>
        )}
      </div>

      {/* Messages */}
      {vm.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isAr ? "خطأ" : "Error"}</AlertTitle>
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
      )}

      {vm.successMessage && (
        <Alert className="border-green-500/50 text-green-700 bg-green-50/50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>{isAr ? "نجاح" : "Success"}</AlertTitle>
          <AlertDescription>{vm.successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{isAr ? "حالة التسجيل:" : "Enrollment Status:"}</span>
                <select
                  value={vm.statusFilter}
                  onChange={(e) => vm.setStatusFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm"
                >
                  <option value="">{isAr ? "الكل" : "All"}</option>
                  <option value="Active">{isAr ? "نشط" : "Active"}</option>
                  <option value="PendingFinance">{isAr ? "في انتظار المالية" : "Pending Finance"}</option>
                  <option value="Completed">{isAr ? "مكتمل" : "Completed"}</option>
                  <option value="Cancelled">{isAr ? "ملغي" : "Cancelled"}</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{isAr ? "حالة الفوترة:" : "Billing Status:"}</span>
                <select
                  value={vm.billingFilter}
                  onChange={(e) => vm.setBillingFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm"
                >
                  <option value="">{isAr ? "الكل" : "All"}</option>
                  <option value="Unbilled">{isAr ? "غير مفوتر" : "Unbilled"}</option>
                  <option value="Invoiced">{isAr ? "مفوتر" : "Invoiced"}</option>
                  <option value="Paid">{isAr ? "مدفوع" : "Paid"}</option>
                  <option value="Overdue">{isAr ? "متأخر" : "Overdue"}</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {isAr ? `إجمالي التسجيلات: ${vm.enrollments.length}` : `Total enrollments: ${vm.enrollments.length}`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      {vm.loading && vm.enrollments.length === 0 ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : vm.enrollments.length === 0 ? (
        <Card className="text-center p-12">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold">{isAr ? "لا توجد تسجيلات نشطة" : "No enrollments found"}</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {isAr ? "ابدأ بقبول وتسجيل الرياضيين في العروض التدريبية وحجز المقاعد." : "Enroll athletes into seasonal offerings with governed capacity."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">
                      {isAr ? (enrollment.athleteNameAr || enrollment.athleteNameEn) : (enrollment.athleteNameEn || enrollment.athleteNameAr || "Athlete")}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? (enrollment.offeringNameAr || enrollment.offeringNameEn) : (enrollment.offeringNameEn || enrollment.offeringNameAr || "Program Offering")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(enrollment.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-sm pb-4">
                {/* Commercial Quote Snapshot */}
                <div className="bg-muted/40 p-2.5 rounded-md text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {isAr ? "اللقطة السعرية الثابتة:" : "Price Snapshot:"}
                    </span>
                    <span className="font-bold text-sm">
                      {enrollment.priceAmount.toLocaleString()} {enrollment.priceCurrency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-muted/80">
                    <span className="text-muted-foreground">{isAr ? "حالة الفاتورة:" : "Billing Status:"}</span>
                    {getBillingBadge(enrollment.billingStatus)}
                  </div>

                  {enrollment.financeInvoiceReference && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3 text-blue-500" />
                        {isAr ? "رقم الفاتورة المالية:" : "Finance Invoice Ref:"}
                      </span>
                      <span className="font-mono text-blue-700 dark:text-blue-400 font-medium">
                        {enrollment.financeInvoiceReference}
                      </span>
                    </div>
                  )}
                </div>

                {enrollment.notes && (
                  <p className="text-xs text-muted-foreground italic bg-background p-1.5 rounded border">
                    "{enrollment.notes}"
                  </p>
                )}

                <div className="text-[11px] text-muted-foreground">
                  {isAr ? `تاريخ التسجيل: ${enrollment.enrollmentDate}` : `Enrolled: ${enrollment.enrollmentDate}`}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  {canUpdate && enrollment.billingStatus === "Unbilled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 gap-1"
                      onClick={() => {
                        setTargetEnrollment(enrollment);
                        setShowFinanceModal(true);
                      }}
                    >
                      <Send className="h-3 w-3 text-primary" />
                      {isAr ? "إصدار فاتورة مالية" : "Handoff to Finance"}
                    </Button>
                  )}
                  {canUpdate && enrollment.status === "PendingFinance" && enrollment.billingStatus === "Invoiced" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs h-8 gap-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => vm.activateEnrollment(enrollment.id)}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {isAr ? "تفعيل التسجيل" : "Activate"}
                    </Button>
                  )}
                  {enrollment.status === "Active" && (
                    <Badge variant="outline" className="text-xs text-green-700 bg-green-50/50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {isAr ? "نشط ومفعل" : "Active"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Enrollment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base">{isAr ? "تسجيل رياضي جديد في عرض تدريبي" : "Create Governed Enrollment"}</h3>
                <p className="text-xs text-muted-foreground">{isAr ? "حجز مقعد ذري مع لقطة سعرية فورية" : "Atomic seat reservation & commercial quote snapshot"}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">{isAr ? "معرف الرياضي (Athlete ID):" : "Athlete ID (GUID):"}</label>
                <input
                  type="text"
                  value={athleteId}
                  onChange={(e) => setAthleteId(e.target.value)}
                  placeholder="Paste Athlete GUID..."
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "معرف العرض التدريبي (Offering ID):" : "Offering ID (GUID):"}</label>
                <input
                  type="text"
                  value={offeringId}
                  onChange={(e) => setOfferingId(e.target.value)}
                  placeholder="Paste Offering GUID..."
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  {isAr ? "يتم التحقق من الطاقة الاستيعابية وحجز المقعد ذرياً" : "Atomic check validates capacity bounds before reserving seat."}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">{isAr ? "قيمة الاشتراك:" : "Price Amount:"}</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">{isAr ? "العملة:" : "Currency:"}</label>
                  <input
                    type="text"
                    value={priceCurrency}
                    onChange={(e) => setPriceCurrency(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "معرف التسعير في الكتالوج (اختياري):" : "Catalog Pricing ID (Optional):"}</label>
                <input
                  type="text"
                  value={catalogPriceId}
                  onChange={(e) => setCatalogPriceId(e.target.value)}
                  placeholder="CatalogPriceDefinitionId reference..."
                  className="w-full rounded-md border px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "ملاحظات التسجيل:" : "Enrollment Notes:"}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Payment arrangements, sibling discounts..."
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button onClick={handleCreateSubmit} disabled={!athleteId || !offeringId}>{isAr ? "تأكيد وحجز المقعد" : "Confirm & Reserve Seat"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Finance Handoff Modal */}
      {showFinanceModal && targetEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-bold text-base">{isAr ? "تسليم الالتزام المالي (Finance Handoff)" : "Finance Obligation Handoff"}</h3>
                <p className="text-xs text-muted-foreground">{targetEnrollment.athleteNameEn} • {targetEnrollment.priceAmount} {targetEnrollment.priceCurrency}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowFinanceModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                {isAr
                  ? "سيتم إنشاء التزام مالي ورقم فاتورة معتمد للمشترك بشكل لا تزامني ودون حظر التشغيل الميداني."
                  : "An idempotent invoice reference will be issued and handed off asynchronously to the Finance module."}
              </p>

              <div>
                <label className="font-semibold block mb-1">{isAr ? "ملاحظات الفوترة:" : "Billing / Invoice Notes:"}</label>
                <textarea
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  rows={2}
                  placeholder="Terms, PO reference, installments..."
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between">
              <Button variant="ghost" onClick={() => setShowFinanceModal(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
              <Button onClick={handleFinanceSubmit} className="gap-1">
                <Send className="h-3.5 w-3.5" />
                {isAr ? "إصدار الفاتورة" : "Issue Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
