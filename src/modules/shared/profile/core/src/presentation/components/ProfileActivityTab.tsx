import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { SectionState } from "@core/ui/section-state";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityTimeline } from "./ActivityTimeline";
import { profileKeys } from "../viewmodels/useProfilePageViewModel";

interface ProfileActivityTabProps {
  activityVm: {
    isLoading: boolean;
    error: string | null;
    groupedEntries: any;
    page: number;
    setPage: (page: number) => void;
    hasMore: boolean;
  };
}

/**
 * Presentation UI component rendering the profile activity tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProfileActivityTab({ activityVm }: ProfileActivityTabProps) {
  const { t, direction } = useI18n();
  const queryClient = useQueryClient();
  const isRtl = direction === "rtl";
  const showPager = activityVm.page > 1 || activityVm.hasMore;
  const isEmpty = Object.keys(activityVm.groupedEntries ?? {}).length === 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.activity.sectionTitle")}</CardTitle>
          <CardDescription>{t("profile.activity.sectionDesc")}</CardDescription>
        </CardHeader>

        <CardContent>
          <SectionState
            isLoading={activityVm.isLoading}
            error={activityVm.error ? new Error(activityVm.error) : null}
            onRetry={() =>
              queryClient.invalidateQueries({ queryKey: profileKeys.securityLog(activityVm.page) })
            }
            isEmpty={isEmpty}
            emptyMessage={t("profile.activity.noEntries")}
            skeletonType="rows"
            skeletonRows={4}
          >
            <ActivityTimeline groupedEntries={activityVm.groupedEntries} />
          </SectionState>

          {showPager && !activityVm.isLoading && (
            <div className="mt-6 flex items-center justify-between border-t border-nx-line pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={activityVm.page <= 1}
                onClick={() => activityVm.setPage(activityVm.page - 1)}
              >
                {isRtl ? (
                  <ChevronRight className="me-1 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronLeft className="me-1 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                {t("common.previous")}
              </Button>
              <span className="text-xs text-nx-ink-2">
                {t("common.page")} {activityVm.page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!activityVm.hasMore}
                onClick={() => activityVm.setPage(activityVm.page + 1)}
              >
                {t("common.next")}
                {isRtl ? (
                  <ChevronLeft className="ms-1 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronRight className="ms-1 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
