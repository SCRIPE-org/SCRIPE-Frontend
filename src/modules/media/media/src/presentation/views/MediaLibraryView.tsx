/**
 * Media Library View
 *
 * Honest placeholder for the Media Library page. There is no working media
 * backend yet — `getMediaContainer()` (see ../../../di.ts) returns an empty
 * container, so this view deliberately does NOT pretend uploads, folders or
 * asset browsing exist. It states plainly that the feature is coming soon
 * instead of rendering a dead "Upload" button.
 */
"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { EmptyState } from "@core/ui/empty-state";
import { Button } from "@core/ui/button";

export const MediaLibraryView = React.memo(function MediaLibraryView() {
  useModuleLocales(() => import("../../../locales"), "media");
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-1 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-nx-ink">{t("media.title")}</h1>
      <p className="text-sm text-nx-ink-2">{t("media.description")}</p>

      <div className="mt-4">
        <EmptyState
          size="lg"
          icon={FolderOpen}
          title={t("media.empty.title")}
          description={t("media.empty.description")}
          action={
            <Button variant="outline" disabled>
              {t("media.empty.action")}
            </Button>
          }
        />
      </div>
    </div>
  );
});
