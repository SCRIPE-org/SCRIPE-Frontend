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

import { useState } from "react";
import { useTenantPlanDetailViewModel } from "../viewmodels/useTenantPlanDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  ArrowLeft,
  Loader2,
  Archive,
  Zap,
  DollarSign,
  GitBranch,
  Tag,
  Settings,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// ── Extracted Tab Components ──
import { GeneralTab } from "../components/GeneralTab";
import { FeaturesTab } from "../components/FeaturesTab";
import { PricingTab } from "../components/PricingTab";
import { VersionsTab } from "../components/VersionsTab";
import { PromotionsTab } from "../components/PromotionsTab";
import { StatCard } from "../components/shared-helpers";

interface TenantPlanDetailViewProps {
  planId: string;
}

export function TenantPlanDetailView({ planId }: TenantPlanDetailViewProps) {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t, language } = useI18n();
  const vm = useTenantPlanDetailViewModel(planId);

  const [activeTab, setActiveTab] = useState<
    "general" | "features" | "pricing" | "versions" | "promotions"
  >("general");

  // ── Loading ──
  if (vm.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (vm.error || !vm.plan) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          {(vm.error as Error)?.message || t("entitlements.tenantPlans.noPlans")}
        </p>
        <Link href="/entitlements/tenant-plans">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="me-2 h-4 w-4" />
            {t("common.back") || "Back"}
          </Button>
        </Link>
      </div>
    );
  }

  const plan = vm.plan;
  const isBusy = vm.isPublishing || vm.isArchiving;

  const tabs = [
    {
      id: "general" as const,
      label: t("entitlements.tenantPlans.tabGeneral") || "General",
      icon: <Settings className="h-3.5 w-3.5" />,
    },
    {
      id: "features" as const,
      label: t("entitlements.tenantPlans.tabFeatures") || "Features",
      icon: <Zap className="h-3.5 w-3.5" />,
      count: vm.localFeatures.size,
    },
    {
      id: "pricing" as const,
      label: t("entitlements.tenantPlans.tabPricing") || "Pricing",
      icon: <DollarSign className="h-3.5 w-3.5" />,
      count: vm.overrides.length + (vm.usdMonthly > 0 || vm.usdYearly > 0 ? 1 : 0),
    },
    {
      id: "versions" as const,
      label: t("entitlements.tenantPlans.tabVersions") || "Versions",
      icon: <GitBranch className="h-3.5 w-3.5" />,
      count: plan.versions.length,
    },
    {
      id: "promotions" as const,
      label: t("entitlements.tenantPlans.tabPromotions") || "Promotions",
      icon: <Tag className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ─────── HEADER ─────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link href="/entitlements/tenant-plans">
            <Button variant="ghost" size="icon" className="mt-1 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
              <Badge variant={plan.statusColor}>{plan.status}</Badge>
              {plan.badgeText && (
                <Badge variant="outline" className="text-xs">
                  {plan.badgeText}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {plan.description || t("entitlements.tenantPlans.description")}
            </p>
          </div>
        </div>

        {/* Lifecycle Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/entitlements/tenant-plans/${planId}/edit`}>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              <Settings className="me-1 h-4 w-4" />
              {t("entitlements.tenantPlans.editSettings") || "Edit Settings"}
            </Button>
          </Link>
          {(plan.isDraft || plan.isPublished) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => vm.archivePlan()}
              disabled={isBusy}
              loading={vm.isArchiving}
              className="border-amber-300 text-amber-600 hover:bg-amber-50"
            >
              {!vm.isArchiving && <Archive className="me-1 h-4 w-4" />}
              {t("entitlements.tenantPlans.archive") || "Archive"}
            </Button>
          )}
        </div>
      </div>

      {/* ─────── QUICK STATS ─────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<DollarSign className="h-4 w-4" />}
          label={t("entitlements.tenantPlans.pricing") || "Starting Price"}
          value={plan.formattedStartingPrice}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label={t("entitlements.tenantPlans.subscribers") || "Subscribers"}
          value={String(plan.activeSubscriberCount)}
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label={t("entitlements.tenantPlans.billingCycles") || "Cycles"}
          value={plan.supportedCycles.join(", ") || "—"}
        />
        <StatCard
          icon={<GitBranch className="h-4 w-4" />}
          label={t("entitlements.tenantPlans.tabVersions") || "Version"}
          value={`v${plan.currentVersion}`}
        />
      </div>

      {/* ─────── TAB NAVIGATION ─────── */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* ─────── TAB CONTENT ─────── */}
      {activeTab === "general" && <GeneralTab plan={plan} t={t} />}
      {activeTab === "features" && (
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
      )}
      {activeTab === "pricing" && (
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
      )}
      {activeTab === "versions" && (
        <VersionsTab
          plan={plan}
          t={t}
          onPublish={(changeNotes) => vm.publishPlan(changeNotes)}
          isPublishing={vm.isPublishing}
        />
      )}
      {activeTab === "promotions" && <PromotionsTab planId={planId} t={t} />}
    </div>
  );
}
