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
      const { t } = useI18n();
      const vm = useActivityLogViewModel();

      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
            );
      }

      if (vm.error) {
            return (
                  <div className="text-center py-20 text-destructive">{vm.error}</div>
            );
      }

      return (
            <div className="space-y-8 max-w-2xl">
                  <div>
                        <h2 className="text-xl font-semibold">{t("profile.activity.title")}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                              {t("profile.activity.description")}
                        </p>
                  </div>

                  <ActivityTimeline groupedEntries={vm.groupedEntries} />

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/40">
                        <Button
                              variant="outline"
                              size="sm"
                              onClick={() => vm.setPage(Math.max(1, vm.page - 1))}
                              disabled={vm.page <= 1}
                        >
                              <ChevronLeft className="h-4 w-4 me-1" />
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
                              <ChevronRight className="h-4 w-4 ms-1" />
                        </Button>
                  </div>
            </div>
      );
}
