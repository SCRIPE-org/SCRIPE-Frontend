"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  CrmSectionHeader,
  CrmShell,
  PipelineSelector,
  useCrmShellViewModel,
} from "@modules/crm/shared";
import { CrmKpiStrip } from "../components/CrmKpiStrip";
import { CrmOverviewSkeleton } from "../components/CrmOverviewSkeleton";
import { CrmPipelineOverviewStrip } from "../components/CrmPipelineOverviewStrip";
import { CrmRecentDealsTable } from "../components/CrmRecentDealsTable";
import { useCrmOverviewViewModel } from "../viewmodels/useCrmOverviewViewModel";

/**
 * CRM Overview executive operational cockpit view displaying primary KPI strips,
 * multi-pipeline velocity progression, and recent deal stage activity.
 */
export function CrmOverviewView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const { activeTab, searchQuery, handleTabChange, handleSearchChange } =
    useCrmShellViewModel("overview");

  const {
    state,
    dealWorkflows,
    selectedPipelineId,
    setSelectedPipelineId,
    effectivePipeline,
    selectedStage,
    filteredDeals,
    refresh,
    selectStage,
  } = useCrmOverviewViewModel(searchQuery, "all", isRtl);

  const activePipeline = effectivePipeline || state.data?.pipeline;

  return (
    <CrmShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onCreateDeal={() => router.push("/crm/opportunities?create=1")}
      onCreateLead={() => router.push("/crm/leads?create=1")}
    >
      <CrmSectionHeader
        title={t("crm.title")}
        subtitle={t("crm.subtitle")}
        badge={activePipeline ? `${activePipeline.totalDeals} ${t("crm.pipeline.dealsCount")}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            <PipelineSelector
              pipelines={dealWorkflows}
              entityType="deal"
              value={selectedPipelineId}
              onChange={setSelectedPipelineId}
              includeAllOption
              data-testid="overview-pipeline-switcher"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              className="h-8 gap-1.5 border-nx-line bg-nx-surface text-xs text-nx-ink hover:bg-nx-raised"
            >
              <RefreshCw className="size-3.5 text-nx-ink-2" />
              <span>{t("crm.actions.refresh")}</span>
            </Button>
          </div>
        }
      />

      {state.stage === "loading" && !state.data && (
        <CrmOverviewSkeleton />
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

      {state.data && activePipeline && (
        <div className="space-y-6">
          <CrmKpiStrip
            stats={state.data.stats}
            onSelectKpi={(statId) => {
              if (statId === "win-rate" || statId === "avg-cycle") {
                router.push("/crm/reports");
                return;
              }
              router.push("/crm/opportunities");
            }}
          />

          <CrmPipelineOverviewStrip
            pipeline={activePipeline}
            activeFilterStage={selectedStage}
            onSelectStage={selectStage}
          />

          <CrmRecentDealsTable deals={filteredDeals} />
        </div>
      )}
    </CrmShell>
  );
}
