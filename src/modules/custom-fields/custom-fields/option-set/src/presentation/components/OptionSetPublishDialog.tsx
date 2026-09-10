"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";

export interface OptionSetPublishDialogProps {
  pendingPublish: OptionSetVersion | null;
  currentPublishedVersionNumber: number | null | undefined;
  isPublishing: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function OptionSetPublishDialog({
  pendingPublish,
  currentPublishedVersionNumber,
  isPublishing,
  onConfirm,
  onOpenChange,
}: OptionSetPublishDialogProps) {
  const { t } = useI18n();

  const publishDescription = useMemo(() => {
    if (!pendingPublish) return "";
    const number = pendingPublish.versionNumber;

    if (currentPublishedVersionNumber !== null && currentPublishedVersionNumber !== undefined) {
      return t("optionSet.versions.publishConfirm.description", {
        number,
        current: currentPublishedVersionNumber,
      });
    }
    return t("optionSet.versions.publishConfirm.descriptionFirst", { number });
  }, [pendingPublish, currentPublishedVersionNumber, t]);

  return (
    <ConfirmationDialog
      open={pendingPublish !== null}
      onOpenChange={onOpenChange}
      variant="warning"
      title={t("optionSet.versions.publishConfirm.title", {
        number: pendingPublish?.versionNumber ?? 0,
      })}
      description={publishDescription}
      confirmText={t("optionSet.versions.publishConfirm.confirm")}
      cancelText={t("common.cancel")}
      isLoading={isPublishing}
      onConfirm={onConfirm}
    />
  );
}
