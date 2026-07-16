import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { ActivityTimeline } from "./ActivityTimeline";

interface ProfileActivityTabProps {
  activityVm: {
    isLoading: boolean;
    groupedEntries: any;
  };
}

/**
 * Presentation UI component rendering the profile activity tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProfileActivityTab({ activityVm }: ProfileActivityTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-card/45 p-5 shadow-sm backdrop-blur-md">
        <h3 className="mb-2 text-base font-bold text-foreground">
          {t("profile.activity.sectionTitle")}
        </h3>
        <p className="mb-6 text-xs text-muted-foreground">{t("profile.activity.sectionDesc")}</p>

        {activityVm.isLoading ? (
          <div className="flex justify-center py-6">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : (
          <ActivityTimeline groupedEntries={activityVm.groupedEntries} />
        )}
      </div>
    </div>
  );
}
