// UI-EXCEPTION: compact studio layout
/**
 * TenantPlan Detail View — Elevated Tier 2
 *
 * Thin orchestrator that renders the header, quick stats, tab navigation,
 * and delegates tab content to dedicated component files.
 *
 * Tab state (features, prices) lives in the VIEWMODEL so it persists
 * across tab switches — matching the Edition detail page pattern.
 *
 * Tab components: GeneralTab, FeaturesTab, PricingTab, VersionsTab, PromotionsTab
 */
"use client";

import { useState, type ReactNode } from "react";
import { useTenantPlanDetailViewModel } from "../viewmodels/useTenantPlanDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { StatCard } from "@core/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { ArrowLeft, Archive, Zap, DollarSign, GitBranch, Tag, Settings, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// ── Extracted Tab Components ──
import { GeneralTab } from "../components/GeneralTab";
import { FeaturesTab } from "../components/FeaturesTab";
import { PricingTab } from "../components/PricingTab";
import { VersionsTab } from "../components/VersionsTab";
import { PromotionsTab } from "../components/PromotionsTab";

interface TenantPlanDetailViewProps {
  planId: string;
}

type TenantPlanDetailTabId = "general" | "features" | "pricing" | "versions" | "promotions";

/**
 * Presentation UI component rendering the tenant plan detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanDetailView({ planId }: TenantPlanDetailViewProps) {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t, language } = useI18n();
  const vm = useTenantPlanDetailViewModel(planId);

  const [activeTab, setActiveTab] = useState<TenantPlanDetailTabId>("general");

  // ── Loading ──
  if (vm.isLoading) {
    return <LoadingSpinner size="lg" fullHeight />;
  }

  if (vm.error || !vm.plan) {
    return (
      <ErrorMessage
        message={(vm.error as Error | null)?.message || t("entitlements.tenantPlans.noPlans")}
        onRetry={vm.refetch}
      />
    );
  }

  const plan = vm.plan;
  const isBusy = vm.isPublishing || vm.isArchiving;
  const statusLabel = plan.isDraft
    ? t("entitlements.tenantPlans.statusDraft")
    : plan.isPublished
      ? t("entitlements.tenantPlans.statusPublished")
      : plan.isArchived
        ? t("entitlements.tenantPlans.statusArchived")
        : plan.status;

  const tabs: Array<{ id: TenantPlanDetailTabId; label: string; icon: ReactNode; count?: number }> = [
    {
      id: "general",
      label: t("entitlements.tenantPlans.tabGeneral"),
      icon: <Settings className="h-3.5 w-3.5" aria-hidden="true" />,
    },
    {
      id: "features",
      label: t("entitlements.tenantPlans.tabFeatures"),
      icon: <Zap className="h-3.5 w-3.5" aria-hidden="true" />,
      count: vm.localFeatures.size,
    },
    {
      id: "pricing",
      label: t("entitlements.tenantPlans.tabPricing"),
      icon: <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />,
      count: vm.overrides.length + (vm.usdMonthly > 0 || vm.usdYearly > 0 ? 1 : 0),
    },
    {
      id: "versions",
      label: t("entitlements.tenantPlans.tabVersions"),
      icon: <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />,
      count: plan.versions.length,
    },
    {
      id: "promotions",
      label: t("entitlements.tenantPlans.tabPromotions"),
      icon: <Tag className="h-3.5 w-3.5" aria-hidden="true" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ─────── HEADER ─────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link href="/entitlements/tenant-plans">
            <Button variant="ghost" size="icon" className="mt-1 shrink-0">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t("common.back")}</span>
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-nx-ink">{plan.name}</h1>
              <Badge variant={plan.statusColor}>{statusLabel}</Badge>
              {plan.badgeText && (
                <Badge variant="outline" className="text-xs">
                  {plan.badgeText}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-nx-ink-2">
              {plan.description || t("entitlements.tenantPlans.description")}
            </p>
          </div>
        </div>

        {/* Lifecycle Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/entitlements/tenant-plans/${planId}/edit`}>
            <Button size="sm" variant="outline">
              <Settings className="me-1 h-4 w-4" aria-hidden="true" />
              {t("entitlements.tenantPlans.editSettings")}
            </Button>
          </Link>
          {(plan.isDraft || plan.isPublished) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => vm.archivePlan()}
              disabled={isBusy}
              loading={vm.isArchiving}
              className="border-warning/30 text-warning hover:bg-warning/10"
            >
              {!vm.isArchiving && <Archive className="me-1 h-4 w-4" aria-hidden="true" />}
              {t("entitlements.tenantPlans.archive")}
            </Button>
          )}
        </div>
      </div>

      {/* ─────── QUICK STATS ─────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label={t("entitlements.tenantPlans.pricing")}
          value={plan.formattedStartingPrice}
        />
        <StatCard
          icon={Users}
          label={t("entitlements.tenantPlans.subscribers")}
          value={String(plan.activeSubscriberCount)}
        />
        <StatCard
          icon={Calendar}
          label={t("entitlements.tenantPlans.billingCycles")}
          value={plan.supportedCycles.join(", ") || "—"}
        />
        <StatCard
          icon={GitBranch}
          label={t("entitlements.tenantPlans.tabVersions")}
          value={`v${plan.currentVersion}`}
        />
      </div>

      {/* ─────── TABS ─────── */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TenantPlanDetailTabId)}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <GeneralTab plan={plan} t={t} />
        </TabsContent>
        <TabsContent value="features">
          <FeaturesTab
            plan={plan}
            totalActiveFeatureCount={vm.featureCatalog.length}
            groupedByCategory={vm.groupedByCategory}
            availableGrouped={vm.availableGrouped}
            localFeatures={vm.localFeatures}
            setFeatureValue={vm.setFeatureValue}
            addFeature={vm.addFeature}
            removeFeature={vm.removeFeature}
            hasChanges={vm.featuresHasChanges}
            onSave={vm.saveFeatures}
            isSaving={vm.isUpdating}
            t={t}
            language={language}
          />
        </TabsContent>
        <TabsContent value="pricing">
          <PricingTab
            plan={plan}
            usdMonthly={vm.usdMonthly}
            usdYearly={vm.usdYearly}
            usdLifetime={vm.usdLifetime}
            setUsdMonthly={vm.setUsdMonthly}
            setUsdYearly={vm.setUsdYearly}
            setUsdLifetime={vm.setUsdLifetime}
            suggestedYearly={vm.suggestedYearly}
            yearlyDiscountPercent={vm.yearlyDiscountPercent}
            setYearlyDiscountPercent={vm.setYearlyDiscountPercent}
            applyDiscountToYearly={vm.applyDiscountToYearly}
            overrides={vm.overrides}
            addOverride={vm.addOverride}
            removeOverride={vm.removeOverride}
            updateOverride={vm.updateOverride}
            availableCurrencies={vm.availableCurrencies}
            preview={vm.preview}
            yearlySavingsPercent={vm.yearlySavingsPercent}
            hasChanges={vm.pricesHasChanges}
            onSave={vm.savePrices}
            onDiscard={vm.discardPricing}
            isSaving={vm.isUpdating}
            ratesLoading={vm.ratesLoading}
            t={t}
          />
        </TabsContent>
        <TabsContent value="versions">
          <VersionsTab
            plan={plan}
            t={t}
            onPublish={(changeNotes) => vm.publishPlan(changeNotes)}
            isPublishing={vm.isPublishing}
          />
        </TabsContent>
        <TabsContent value="promotions">
          <PromotionsTab planId={planId} t={t} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
