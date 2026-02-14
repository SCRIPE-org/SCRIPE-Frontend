"use client";

/**
 * ProfileActivityView — Security activity log page
 */
import { useI18n } from "@core/providers/i18n-provider";
import { useActivityLogViewModel } from "../viewmodels/useActivityLogViewModel";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { Button } from "@core/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export function ProfileActivityView() {
  const { t, direction } = useI18n();
  const vm = useActivityLogViewModel();

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vm.error) {
    return <div className="py-20 text-center text-destructive">{vm.error}</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{t("profile.activity.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.activity.description")}</p>
      </div>

      <ActivityTimeline groupedEntries={vm.groupedEntries} />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 border-t border-border/40 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => vm.setPage(Math.max(1, vm.page - 1))}
          disabled={vm.page <= 1}
        >
          {direction === "rtl" ? (
            <ChevronRight className="me-1 h-4 w-4" />
          ) : (
            <ChevronLeft className="me-1 h-4 w-4" />
          )}
          {t("common.previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("common.page")} {vm.page}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => vm.setPage(vm.page + 1)}
          disabled={!vm.hasMore}
        >
          {t("common.next")}
          {direction === "rtl" ? (
            <ChevronLeft className="me-1 h-4 w-4" />
          ) : (
            <ChevronRight className="ms-1 h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
