/**
 * TenantPlan Detail View — Elevated Tier 2
 *
 * Thin orchestrator that renders the header, quick stats, tab navigation,
 * and delegates tab content to dedicated component files.
 *
 * Tab components: GeneralTab, FeaturesTab, PricingTab, VersionsTab, PromotionsTab
 * Shared helpers: StatCard, InfoRow, FlagRow, formatAmount
 */
"use client";

import { useState } from "react";
import { useTenantPlanDetailViewModel } from "../viewmodels/useTenantPlanDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  ArrowLeft, Loader2, Rocket, Archive, Zap, DollarSign,
  GitBranch, Tag, Settings, Users, Calendar,
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

  const [activeTab, setActiveTab] = useState<"general" | "features" | "pricing" | "versions" | "promotions">("general");

  // ── Loading ──
  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (vm.error || !vm.plan) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">{(vm.error as Error)?.message || t("entitlements.tenantPlans.noPlans")}</p>
        <Link href="/entitlements/tenant-plans">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="h-4 w-4 me-2" />
            {t("common.back") || "Back"}
          </Button>
        </Link>
      </div>
    );
  }

  const plan = vm.plan;
  const isBusy = vm.isPublishing || vm.isArchiving;

  const tabs = [
    { id: "general" as const, label: t("common.general") || "General", icon: <Settings className="h-3.5 w-3.5" /> },
    { id: "features" as const, label: t("entitlements.tenantPlans.tabFeatures") || "Features", icon: <Zap className="h-3.5 w-3.5" />, count: plan.featureCount },
    { id: "pricing" as const, label: t("entitlements.tenantPlans.tabPricing") || "Pricing", icon: <DollarSign className="h-3.5 w-3.5" />, count: plan.priceCount },
    { id: "versions" as const, label: t("entitlements.tenantPlans.tabVersions") || "Versions", icon: <GitBranch className="h-3.5 w-3.5" />, count: plan.versions.length },
    { id: "promotions" as const, label: t("entitlements.tenantPlans.tabPromotions") || "Promotions", icon: <Tag className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ─────── HEADER ─────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/entitlements/tenant-plans">
            <Button variant="ghost" size="icon" className="mt-1 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
              <Badge variant={plan.statusColor}>{plan.status}</Badge>
              {plan.badgeText && (
                <Badge variant="outline" className="text-xs">
                  {plan.badgeText}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {plan.description || t("entitlements.tenantPlans.description")}
            </p>
          </div>
        </div>

        {/* Lifecycle Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {plan.isDraft && (
            <Button
              size="sm"
              onClick={() => vm.publishPlan()}
              disabled={isBusy}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {vm.isPublishing ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <Rocket className="h-4 w-4 me-1" />}
              {t("entitlements.tenantPlans.publish") || "Publish"}
            </Button>
          )}
          {plan.isPublished && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => vm.archivePlan()}
              disabled={isBusy}
              className="text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              {vm.isArchiving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <Archive className="h-4 w-4 me-1" />}
              {t("entitlements.tenantPlans.archive") || "Archive"}
            </Button>
          )}
        </div>
      </div>

      {/* ─────── QUICK STATS ─────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-1">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* ─────── TAB CONTENT ─────── */}
      {activeTab === "general" && <GeneralTab plan={plan} t={t} />}
      {activeTab === "features" && <FeaturesTab plan={plan} t={t} language={language} />}
      {activeTab === "pricing" && <PricingTab plan={plan} t={t} />}
      {activeTab === "versions" && <VersionsTab plan={plan} t={t} />}
      {activeTab === "promotions" && <PromotionsTab planId={planId} t={t} />}
    </div>
  );
}
