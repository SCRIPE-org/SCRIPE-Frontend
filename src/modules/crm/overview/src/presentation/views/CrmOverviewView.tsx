"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

import { CrmShell } from "../components/CrmShell";
import { CrmSectionHeader } from "../components/CrmSectionHeader";
import { CrmKpiStrip } from "../components/CrmKpiStrip";
import { CrmPipelineOverviewStrip } from "../components/CrmPipelineOverviewStrip";
import { CrmRecentDealsTable } from "../components/CrmRecentDealsTable";

import { useCrmShellViewModel } from "../viewmodels/useCrmShellViewModel";
import { useCrmOverviewViewModel } from "../viewmodels/useCrmOverviewViewModel";

export function CrmOverviewView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const { activeTab, searchQuery, handleTabChange, handleSearchChange } =
    useCrmShellViewModel("overview");

  const { state, selectedStage, filteredDeals, refresh, selectStage } =
    useCrmOverviewViewModel(searchQuery);

  return (
    <CrmShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onCreateDeal={() => router.push("/crm/opportunities")}
      onCreateLead={() => router.push("/crm/leads")}
    >
      <CrmSectionHeader
        title={t("crm.title")}
        subtitle={t("crm.subtitle")}
        badge="C1 Canonical"
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            className="h-8 gap-1.5 border-nx-line bg-nx-surface text-xs text-nx-ink hover:bg-nx-surfaceSubtle"
          >
            <RefreshCw className="size-3.5 text-nx-ink-2" />
            <span>{t("crm.actions.refresh")}</span>
          </Button>
        }
      />

      {state.stage === "loading" && !state.data && (
        <div className="flex h-64 items-center justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {state.stage === "failed" && (
        <Alert variant="destructive" className="max-w-xl mx-auto my-6" dir={isRtl ? "rtl" : "ltr"}>
          <AlertCircle className="size-4" />
          <AlertTitle>{t("crm.errors.loadFailed")}</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <span className="text-xs">{state.error}</span>
            <Button size="sm" variant="outline" onClick={refresh} className="text-xs h-7">
              {t("crm.errors.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="space-y-6">
          {/* 4 Primary KPI Stat Cards */}
          <CrmKpiStrip stats={state.data.stats} />

          {/* Pipeline velocity strip with Party Verification Gate indicators */}
          <CrmPipelineOverviewStrip
            pipeline={state.data.pipeline}
            activeFilterStage={selectedStage}
            onSelectStage={selectStage}
          />

          {/* D4-scoped active deals table */}
          <CrmRecentDealsTable deals={filteredDeals} />
        </div>
      )}
    </CrmShell>
  );
}
