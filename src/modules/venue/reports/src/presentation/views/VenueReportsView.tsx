"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  CircleDollarSign,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

export function VenueReportsView() {
  const { t, language, direction } = useI18n();
  const isRtl = language === "ar";
  const canViewMoney = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);

  return (
    <div
      className="space-y-6 max-w-[1400px] mx-auto text-nx-ink"
      dir={direction}
      data-testid="venue-reports-view"
    >
      {/* Page Header */}
      <PageHeader
        icon={BarChart3}
        title={t("venueNav.reports", { defaultValue: isRtl ? "التقارير والتحليلات" : "Reports & Analytics" })}
        description={
          isRtl
            ? "المؤشرات التشغيلية، تحليل الإيرادات، والتقارير التنفيذية لمنشأتك الرياضية."
            : "Operational metrics, revenue performance, and executive reports for your venue."
        }
      />

      {/* Honest, Client-Safe Status Banner */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent shadow-xs">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                <Clock className="size-3 me-1 inline-block" />
                {isRtl ? "قيد الإعداد التنفيذي" : "Configuration In Progress"}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl ? "بيانات حقيقية معتمدة" : "Authoritative Data Pipeline"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isRtl ? "أدوات التقارير قيد الإعداد" : "Reporting tools are being configured"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isRtl
                ? "يجري حالياً إعداد نماذج التقارير الإحصائية والتحليلات المعتمدة لمنشأتك الرياضية. يمكنك الاطلاع على النشاط اللحظي المباشر والأرصدة المالية اليوم عبر لوحة التحكم وقسم الشؤون المالية."
                : "Authoritative analytics and specialized reporting modules are being configured for your venue operations. Real-time court utilization and financial balances are active now in Dashboard and Money."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button asChild variant="outline" size="sm" className="gap-2 text-xs font-semibold">
              <Link href="/venue">
                <CalendarDays className="size-3.5 text-blue-600" />
                <span>{isRtl ? "لوحة التحكم" : "Dashboard"}</span>
              </Link>
            </Button>
            {canViewMoney && (
              <Button asChild size="sm" className="gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/venue/money">
                  <CircleDollarSign className="size-3.5" />
                  <span>{isRtl ? "الشؤون المالية" : "Money Workspace"}</span>
                  <ArrowRight className="size-3 rtl:rotate-180" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview of Upcoming Executive Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <CircleDollarSign className="size-5" />
            </div>
            <CardTitle className="text-sm font-bold">
              {isRtl ? "تقرير الإيرادات والمستحقات" : "Revenue & Receivables Report"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRtl ? "ملخص الإيرادات المحصلة حسب الملعب وطريقة الدفع." : "Breakdown of collected cash, payment channels, and open invoices."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>{isRtl ? "الحالة" : "Status"}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {isRtl ? "متاح في المالية" : "Available in Money"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <TrendingUp className="size-5" />
            </div>
            <CardTitle className="text-sm font-bold">
              {isRtl ? "معدلات إشغال الملاعب" : "Court Occupancy & Demand"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRtl ? "ساعات الذروة، ونسب استغلال الملاعب والمساحات الرياضية." : "Peak operating hours, slot utilization, and space demand patterns."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>{isRtl ? "الحالة" : "Status"}</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {isRtl ? "متاح في لوحة التحكم" : "Available on Dashboard"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="size-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-sm font-bold">
              {isRtl ? "سجل الامتثال والعمليات" : "Operational Audit Trail"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRtl ? "سجل الحجوزات والتعديلات وإلغاءات المواعيد وتغيير الملاعب." : "Immutable record of bookings, cancellations, check-ins, and changes."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>{isRtl ? "الحالة" : "Status"}</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {isRtl ? "قيد الربط البرمجي" : "Pipeline Scheduled"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
