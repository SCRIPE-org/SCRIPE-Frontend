"use client";

/**
 * ProfileActivityView
 *
 * SOC2 Enterprise Compliance Audit Trail view.
 * Streams tamper-evident security logs, provides granular multi-criteria filtering,
 * forensic JSON payload inspection via slide-out drawer, and CSV reporting.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useComplianceAuditViewModel } from "../viewmodels/useComplianceAuditViewModel";
import { ForensicPayloadDrawer } from "../components/ForensicPayloadDrawer";
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  Clock,
  Globe,
  UserCheck,
  ChevronRight,
  Code,
  ShieldCheck,
} from "lucide-react";

/**
 * ProfileActivityView Component
 *
 * Renders the SOC2 compliance audit log with filtering and forensic inspection.
 */
export function ProfileActivityView() {
  const { t } = useI18n();
  const {
    entries,
    isLoading,
    refetch,
    searchQuery,
    setSearchQuery,
    eventTypeFilter,
    setEventTypeFilter,
    outcomeFilter,
    setOutcomeFilter,
    uniqueEventTypes,
    selectedEntry,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    exportCsv,
  } = useComplianceAuditViewModel();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.activity.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.activity.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{t("profile.common.refresh")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={entries.length === 0}
            className="text-xs h-8 gap-1.5 font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("profile.audit.exportCsvBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border border-nx-line bg-nx-surface p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-nx-ink-3 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("profile.audit.searchPlaceholder")}
              className="text-xs ps-8 h-9 bg-nx-raised border-nx-line text-nx-ink"
            />
          </div>

          {/* Event Type Filter */}
          <div className="w-full md:w-56">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full text-xs h-9 bg-nx-raised border-nx-line text-nx-ink">
                <SelectValue placeholder={t("profile.audit.allEventTypes")} />
              </SelectTrigger>
              <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                <SelectItem value="ALL" className="text-xs">
                  {t("profile.audit.allEventTypes")}
                </SelectItem>
                {uniqueEventTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outcome Filter */}
          <div className="w-full md:w-40">
            <Select
              value={outcomeFilter}
              onValueChange={(val: any) => setOutcomeFilter(val)}
            >
              <SelectTrigger className="w-full text-xs h-9 bg-nx-raised border-nx-line text-nx-ink">
                <SelectValue placeholder={t("profile.audit.allOutcomes")} />
              </SelectTrigger>
              <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
                <SelectItem value="ALL" className="text-xs">
                  {t("profile.audit.allOutcomes")}
                </SelectItem>
                <SelectItem value="SUCCESS" className="text-xs">
                  {t("profile.audit.onlySuccess")}
                </SelectItem>
                <SelectItem value="FAILURE" className="text-xs">
                  {t("profile.audit.onlyFailure")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Audit Log Stream */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-4 rounded-xl border border-nx-line bg-nx-surface animate-pulse text-xs text-nx-ink-3">
            {t("profile.common.loading")}
          </div>
        ) : entries.length === 0 ? (
          <Card className="border border-nx-line bg-nx-surface p-6 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-nx-accent-wash text-nx-accent flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
            </div>
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.audit.noEntriesTitle")}
            </p>
            <p className="text-[11px] text-nx-ink-3">
              {t("profile.audit.noEntriesDesc")}
            </p>
          </Card>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => openDrawer(entry)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDrawer(entry);
                }
              }}
              className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                    entry.isSuccess
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-destructive/20 bg-destructive/10 text-destructive"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink truncate">
                      {entry.eventType}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] py-0 px-1.5 ${
                        entry.isSuccess
                          ? "border-success/30 text-success"
                          : "border-destructive/30 text-destructive"
                      }`}
                    >
                      {entry.isSuccess
                        ? t("profile.audit.statusSuccess")
                        : t("profile.audit.statusFailure")}
                    </Badge>
                    {entry.impersonatedBy && (
                      <Badge
                        variant="outline"
                        className="border-warning/40 text-warning text-[9px] py-0 px-1.5 flex items-center gap-1"
                      >
                        <UserCheck className="h-2.5 w-2.5" />
                        <span>@{entry.impersonatedBy}</span>
                      </Badge>
                    )}
                  </div>

                  {entry.details && (
                    <p className="text-[11px] text-nx-ink-2 mt-0.5 truncate">
                      {entry.details}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-nx-ink-3 font-mono flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{entry.timestamp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{entry.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ms-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-[10px] text-nx-ink-3 group-hover:text-nx-accent gap-1"
                >
                  <Code className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("profile.audit.inspectJsonBtn")}</span>
                  <ChevronRight className="h-3.5 w-3.5 ms-0.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Forensic Payload Inspector Drawer */}
      <ForensicPayloadDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        entry={selectedEntry}
      />
    </div>
  );
}
