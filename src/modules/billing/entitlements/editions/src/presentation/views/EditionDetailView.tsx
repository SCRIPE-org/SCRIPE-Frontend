// UI-EXCEPTION: compact studio layout
/** Edition Detail View — Thin orchestrator delegating to modular tab components. */
"use client";

import { useState } from "react";
import { useEditionDetailViewModel } from "../viewmodels/useEditionDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { ArrowLeft, Zap, GitBranch, DollarSign, Tag, Settings2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { LoadingSpinner } from "@core/ui/loading-spinner";

// ── Extracted Tab Components ──
import { FeaturesTab } from "../components/FeaturesTab";
import { VersionsTab } from "../components/VersionsTab";
import { PricingTab } from "../components/PricingTab";
import { PromotionsTab } from "../components/PromotionsTab";
import { ChangeActionBar } from "../components/ChangeActionBar";

interface EditionDetailViewProps {
  editionId: string;
}

/**
 * Presentation UI component rendering the edition detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EditionDetailView({ editionId }: EditionDetailViewProps) {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t, language } = useI18n();
  const vm = useEditionDetailViewModel(editionId);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"features" | "pricing" | "versions" | "promotions">(
    "features"
  );

  // ── Loading ──
  if (vm.isLoading) {
    return <LoadingSpinner size="lg" fullHeight />;
  }

  if (vm.error || !vm.edition) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          {vm.error?.message || t("entitlements.editions.notFound")}
        </p>
        <Link href="/entitlements/editions">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="me-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </Link>
      </div>
    );
  }

  const edition = vm.edition;

  const tabs = [
    {
      id: "features" as const,
      label: t("entitlements.features.title"),
      icon: <Zap className="h-3.5 w-3.5" />,
    },
    ...(!edition.isFree
      ? [
          {
            id: "pricing" as const,
            label: t("entitlements.pricing.title"),
            icon: <DollarSign className="h-3.5 w-3.5" />,
          },
          {
            id: "promotions" as const,
            label: t("entitlements.promotions.title"),
            icon: <Tag className="h-3.5 w-3.5" />,
          },
        ]
      : []),
    {
      id: "versions" as const,
      label: t("entitlements.editions.versions.title"),
      icon: <GitBranch className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* ─────── HEADER ─────── */}
      <div className="flex items-start gap-3">
        <Link href="/entitlements/editions">
          <Button variant="ghost" size="icon" className="mt-1 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{edition.getDisplayName(language)}</h1>
          <p className="mt-0.5 text-sm text-nx-ink-2">
            {edition.description || t("entitlements.editions.manageFeaturesDescription")}
          </p>
        </div>
        {/* Edit Settings button — routes to wizard */}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => router.push(`/entitlements/editions/${editionId}/edit`)}
        >
          <Settings2 className="h-4 w-4" />
          Edit Settings
        </Button>
      </div>

      {/* ─────── TAB NAVIGATION ─────── */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none ${
              activeTab === tab.id
                ? "border-nx-accent text-nx-accent"
                : "border-transparent text-nx-ink-2 hover:border-nx-line hover:text-nx-ink"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────── TAB CONTENT ─────── */}
      {activeTab === "features" && (
        <FeaturesTab
          edition={edition}
          moduleGroups={vm.moduleGroups}
          getEffectiveValue={vm.getEffectiveValue}
          getEffectiveLabel={vm.getEffectiveLabel}
          getEffectiveHighlight={vm.getEffectiveHighlight}
          setLocalValue={vm.setLocalValue}
          setLocalLabel={vm.setLocalLabel}
          setLocalHighlight={vm.setLocalHighlight}
          removeFeature={vm.removeFeature}
          isRemovingFeature={vm.isRemovingFeature}
          overflowPolicy={vm.overflowPolicy}
          setOverflowPolicy={vm.setOverflowPolicy}
          overflowPolicyChanged={vm.overflowPolicyChanged}
          collapsedModules={vm.collapsedModules}
          toggleModule={vm.toggleModule}
          expandAll={vm.expandAll}
          collapseAll={vm.collapseAll}
        />
      )}

      {activeTab === "pricing" && (
        <PricingTab
          editionId={editionId}
          allowMonthly={edition.allowMonthly}
          allowYearly={edition.allowYearly}
          allowLifetime={edition.allowLifetime}
        />
      )}

      {activeTab === "promotions" && (
        <PromotionsTab
          editionId={editionId}
          allowMonthly={edition.allowMonthly}
          allowYearly={edition.allowYearly}
          allowLifetime={edition.allowLifetime}
        />
      )}

      {activeTab === "versions" && <VersionsTab editionId={editionId} />}

      {/* ─────── STICKY ACTION BAR (only when changes pending) ─────── */}
      {vm.hasUnsavedChanges && (
        <ChangeActionBar
          modifiedCount={vm.modifiedCount}
          isCreatingVersion={vm.isCreatingVersion}
          isDirectApplying={vm.isDirectApplying}
          createVersionWithChanges={vm.createVersionWithChanges}
          directApplyChanges={vm.directApplyChanges}
          discardChanges={vm.discardChanges}
        />
      )}
    </div>
  );
}
