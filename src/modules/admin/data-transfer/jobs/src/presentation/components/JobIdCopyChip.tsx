"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { toast } from "@core/ui/sileo-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

/** Props for JobIdCopyChip component. */
export interface JobIdCopyChipProps {
  jobId: string;
  testId?: string;
  className?: string;
}

/**
 * Interactive truncated Job ID chip that displays the full UUID in a shared Tooltip
 * and copies the full ID to clipboard on click / keyboard activation.
 */
export function JobIdCopyChip({
  jobId,
  testId,
  className,
}: JobIdCopyChipProps): React.ReactElement {
  const { t } = useI18n();

  const handleCopy = () => {
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    if (clipboard?.writeText) {
      void clipboard.writeText(jobId).then(
        () => {
          toast.success({
            id: `dx-copy-job-${jobId}`,
            title: jobId.slice(0, 8),
            description: t("adminDataTransferJobs.actions.jobIdCopied", {
              defaultValue: "Job ID copied to clipboard.",
            }),
          });
        },
        () => {
          /* ignore clipboard errors in restricted contexts */
        }
      );
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          dir="ltr"
          onClick={handleCopy}
          aria-label={jobId}
          data-testid={testId}
          className={cn(
            "h-auto w-fit max-w-full rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-medium text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink",
            className
          )}
        >
          <code className="truncate">{jobId.slice(0, 8)}...</code>
        </Button>
      </TooltipTrigger>
      <TooltipContent dir="ltr" className="font-mono text-xs">
        {jobId}
      </TooltipContent>
    </Tooltip>
  );
}
