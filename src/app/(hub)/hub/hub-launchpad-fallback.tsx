"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";

/**
 * Suspense loading fallback for the standalone `/hub` Launchpad layout.
 * Mirrors the quiet topbar and centered squircle grid without left-rail chrome.
 */
export function HubLaunchpadFallback() {
  const { t } = useI18n();

  return (
    <output
      aria-busy="true"
      aria-label={t("common.loading")}
      data-testid="hub-launchpad-fallback"
      className="flex min-h-0 flex-1 flex-col bg-nx-ground"
    >
      <div className="flex h-14 min-h-[56px] shrink-0 items-center justify-between border-b border-nx-line/70 px-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Skeleton shape="block" className="h-8 w-8 rounded-nx-md" />
          <Skeleton shape="text" className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton shape="control" className="h-9 w-24" />
          <Skeleton shape="control" className="h-9 w-9" />
          <Skeleton shape="control" className="h-9 w-9" />
          <Skeleton shape="circle" className="h-9 w-9" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="grid w-full grid-cols-3 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 6 }, (_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2.5 p-1.5">
              <Skeleton shape="block" className="h-[72px] w-[72px] rounded-[18px]" />
              <Skeleton shape="text" className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </output>
  );
}
