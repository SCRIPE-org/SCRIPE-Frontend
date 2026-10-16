"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { SectionState } from "@core/ui/section-state";
import { ListOrdered, Rocket } from "lucide-react";
import { OptionSetItemsEditor, type OptionSetDraftItem } from "./OptionSetItemsEditor";
import { OptionSetStatusBadge, OptionSetStatusHint } from "./OptionSetStatusBadge";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetRefusal } from "../viewmodels/useOptionSetViewModel";
import type { useOptionSetVersionEditor } from "../viewmodels/useOptionSetVersionEditor";

/**
 * Documentation for module export
 */
export interface OptionSetOpenedVersionSectionProps {
  openVersion: OptionSetVersion | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  editor: ReturnType<typeof useOptionSetVersionEditor>;
  tableRows: OptionSetDraftItem[];
  handleTableChange: (next: OptionSetDraftItem[]) => void;
  isOpenVersionEditable: boolean;
  openVersionReadOnlyNote: string | null;
  publishRefusal: OptionSetRefusal | null;
  isPublishing: boolean;
  onOpenPublishDialog: (version: OptionSetVersion) => void;
  describeRefusal: (refusal: OptionSetRefusal) => string;
  openHeadingId: string;
}

/**
 * Documentation for OptionSetOpenedVersionSection
 */
export function OptionSetOpenedVersionSection({
  openVersion,
  isLoading,
  isError,
  onRetry,
  editor,
  tableRows,
  handleTableChange,
  isOpenVersionEditable,
  openVersionReadOnlyNote,
  publishRefusal,
  isPublishing,
  onOpenPublishDialog,
  describeRefusal,
  openHeadingId,
}: OptionSetOpenedVersionSectionProps) {
  const { t } = useI18n();

  if (isError) {
    return (
      <div className="flex flex-col gap-3 rounded-nx-md border border-nx-line p-3">
        <ErrorMessage size="sm" message={t("optionSet.versionLoadFailed")} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-nx-md border border-nx-line p-3">
      <SectionState
        isLoading={isLoading || openVersion === null || !editor.isReady}
        skeletonType="rows"
        skeletonRows={4}
        isEmpty={false}
      >
        {openVersion ? (
          <div className="flex flex-col gap-3" role="group" aria-labelledby={openHeadingId}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 id={openHeadingId} className="text-sm font-semibold text-nx-ink">
                    {t("optionSet.versions.versionLabel", {
                      number: openVersion.versionNumber,
                    })}
                  </h3>
                  <OptionSetStatusBadge kind="version" status={openVersion.status} />
                </div>
                <OptionSetStatusHint kind="version" status={openVersion.status} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isOpenVersionEditable ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void editor.save()}
                    disabled={!editor.canSave}
                  >
                    {t("optionSet.versions.saveDraft")}
                  </Button>
                ) : null}

                {publishRefusal === null ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => onOpenPublishDialog(openVersion)}
                    disabled={isPublishing}
                  >
                    <Rocket className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    {t("optionSet.versions.publish")}
                  </Button>
                ) : null}
              </div>
            </div>

            <OptionSetItemsEditor
              items={tableRows}
              onItemsChange={handleTableChange}
              isEditable={isOpenVersionEditable}
              readOnlyNote={openVersionReadOnlyNote}
              isSaving={editor.isSaving}
              isDirty={editor.isDirty}
            />

            {isOpenVersionEditable &&
            editor.saveRefusal !== null &&
            editor.saveRefusal.reason === "invalid" ? (
              <p className="text-xs text-destructive">{describeRefusal(editor.saveRefusal)}</p>
            ) : null}
          </div>
        ) : (
          <EmptyState icon={ListOrdered} size="sm" bare title={t("optionSet.versionLoadFailed")} />
        )}
      </SectionState>
    </div>
  );
}
