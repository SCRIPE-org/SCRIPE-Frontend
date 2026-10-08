"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { SectionState } from "@core/ui/section-state";
import { FilePlus2, History, Lock } from "lucide-react";
import {
  newOptionSetDraftItem,
  type OptionSetDraftItem,
} from "../components/OptionSetItemsEditor";
import { OptionSetVersionChainTable } from "../components/OptionSetVersionChainTable";
import { OptionSetPublishDialog } from "../components/OptionSetPublishDialog";
import { OptionSetNewDraftSection } from "../components/OptionSetNewDraftSection";
import { OptionSetOpenedVersionSection } from "../components/OptionSetOpenedVersionSection";
import {
  diffTableCommit,
  toTableRows,
} from "../form/optionSetItemsEditorBridge";
import { type OptionSetRefusal } from "../viewmodels/useOptionSetViewModel";
import { useOptionSetVersionQuery } from "../viewmodels/useOptionSetVersionQuery";
import { useOptionSetVersionEditor } from "../viewmodels/useOptionSetVersionEditor";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";

/**
 * Documentation for module export
 */
export interface OptionSetDetailPanelProps {
  set: OptionSet | null;
  versions: readonly OptionSetVersion[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  createVersionRefusal: OptionSetRefusal | null;
  refusePublish: (version: OptionSetVersion) => OptionSetRefusal | null;
  describeRefusal: (refusal: OptionSetRefusal) => string;
  onCreateVersion: (items: OptionSetItemInput[]) => Promise<string | null>;
  onPublishVersion: (version: OptionSetVersion) => Promise<boolean>;
  isCreatingVersion: boolean;
  isPublishing: boolean;
}

/**
 * Presentation UI component rendering one option set's version chain and its draft editor.
 */
export function OptionSetDetailPanel({
  set,
  versions,
  isLoading,
  isError,
  onRetry,
  createVersionRefusal,
  refusePublish,
  describeRefusal,
  onCreateVersion,
  onPublishVersion,
  isCreatingVersion,
  isPublishing,
}: OptionSetDetailPanelProps) {
  const { t, language } = useI18n();
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const chainHeadingId = `${baseId}-chain-heading`;
  const openHeadingId = `${baseId}-open-heading`;
  const newDraftHeadingId = `${baseId}-new-draft-heading`;

  const [openVersionId, setOpenVersionId] = useState<string | null>(null);
  const [newDraftRows, setNewDraftRows] = useState<OptionSetDraftItem[] | null>(null);
  const [pendingPublish, setPendingPublish] = useState<OptionSetVersion | null>(null);

  const versionQuery = useOptionSetVersionQuery(openVersionId);
  const openVersion = versionQuery.data ?? null;

  const editor = useOptionSetVersionEditor({ set, version: openVersion });
  const editorRows = editor.rows;
  const tableRows = useMemo(() => toTableRows(editorRows), [editorRows]);

  const handleTableChange = useCallback(
    (next: OptionSetDraftItem[]) => {
      const commit = diffTableCommit(editor.rows, next);

      switch (commit.kind) {
        case "add":
          editor.addItem();
          return;
        case "remove":
          editor.removeItem(commit.rowId);
          return;
        case "move":
          editor.moveBefore(commit.rowId, commit.beforeRowId);
          return;
        case "update":
          if (commit.changes.status === "Deactivated") {
            editor.deactivateItem(commit.rowId);
            return;
          }
          if (commit.changes.status === "Active") {
            editor.reactivateItem(commit.rowId);
            return;
          }
          editor.updateItem(commit.rowId, commit.changes);
          return;
        case "none":
          return;
      }
    },
    [editor]
  );

  const isPlatformMaintained = set?.isPlatformMaintained === true;
  const isPlatformOwnedElsewhere = createVersionRefusal?.reason === "platformOwned";

  const existingDraft = useMemo(
    () => versions.find((version) => version.isDraft) ?? null,
    [versions]
  );

  const canOfferNewDraft = createVersionRefusal === null && existingDraft === null;

  const startNewDraft = useCallback(() => {
    setNewDraftRows([newOptionSetDraftItem()]);
    setOpenVersionId(null);
  }, []);

  const blockingSaveRefusal =
    editor.saveRefusal !== null && editor.saveRefusal.reason !== "invalid"
      ? editor.saveRefusal
      : null;

  const isOpenVersionEditable =
    openVersion !== null &&
    openVersion.isEditable &&
    editor.isReady &&
    blockingSaveRefusal === null;

  const openVersionReadOnlyNote = useMemo(() => {
    if (openVersion === null || isOpenVersionEditable) return null;

    if (!openVersion.isEditable) {
      return t("optionSet.versions.readOnlyNote", {
        status: t(`optionSet.versions.status.${openVersion.status}`),
      });
    }
    if (isPlatformMaintained) return t("optionSet.refusals.systemManaged");
    if (blockingSaveRefusal) return describeRefusal(blockingSaveRefusal);
    return null;
  }, [
    openVersion,
    isOpenVersionEditable,
    isPlatformMaintained,
    blockingSaveRefusal,
    describeRefusal,
    t,
  ]);

  const publishRefusal = openVersion ? refusePublish(openVersion) : null;

  const handleConfirmPublish = useCallback(async () => {
    if (!pendingPublish) return;
    const published = await onPublishVersion(pendingPublish);
    if (published) setPendingPublish(null);
  }, [pendingPublish, onPublishVersion]);

  if (isError) {
    return <ErrorMessage message={t("optionSet.detailLoadFailed")} onRetry={onRetry} />;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-nx-md border border-nx-line p-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-base font-semibold text-nx-ink">
          {set ? set.displayLabel(language) : t("optionSet.versions.title")}
        </h2>
        {set ? (
          <p className="text-xs text-nx-ink-2">
            <span className="font-mono" dir="ltr">
              {set.stableKey}
            </span>
            {set.description ? <span className="ms-2">{set.description}</span> : null}
          </p>
        ) : null}
      </div>

      {isPlatformMaintained ? (
        <Alert variant="warning">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("optionSet.readOnly.systemManaged.title")}</AlertTitle>
          <AlertDescription>{t("optionSet.readOnly.systemManaged.description")}</AlertDescription>
        </Alert>
      ) : isPlatformOwnedElsewhere ? (
        <Alert variant="info">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("optionSet.readOnly.platformOwned.title")}</AlertTitle>
          <AlertDescription>{t("optionSet.readOnly.platformOwned.description")}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── The chain ── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 id={chainHeadingId} className="text-sm font-semibold text-nx-ink">
              {t("optionSet.versions.title")}
            </h3>
            <p className="text-xs text-nx-ink-2">{t("optionSet.versions.description")}</p>
          </div>
          {canOfferNewDraft && newDraftRows === null ? (
            <Button type="button" size="sm" variant="secondary" onClick={startNewDraft}>
              <FilePlus2 className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {t("optionSet.versions.createDraft")}
            </Button>
          ) : null}
        </div>

        {canOfferNewDraft ? (
          <p className="text-xs text-nx-ink-3">{t("optionSet.versions.createDraftHint")}</p>
        ) : null}

        <SectionState isLoading={isLoading} skeletonType="rows" skeletonRows={3} isEmpty={false}>
          {versions.length === 0 ? (
            <EmptyState
              icon={History}
              size="sm"
              title={t("optionSet.versions.noItems.title")}
              description={t("optionSet.versions.noItems.description")}
              action={
                canOfferNewDraft && newDraftRows === null ? (
                  <Button type="button" size="sm" onClick={startNewDraft}>
                    <FilePlus2 className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    {t("optionSet.versions.createDraft")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <OptionSetVersionChainTable
              versions={versions}
              openVersionId={openVersionId}
              onOpenVersion={(versionId) => {
                setOpenVersionId(versionId);
                setNewDraftRows(null);
              }}
              chainHeadingId={chainHeadingId}
            />
          )}
        </SectionState>
      </div>

      {/* ── A draft being created ── */}
      {newDraftRows !== null ? (
        <OptionSetNewDraftSection
          newDraftRows={newDraftRows}
          setNewDraftRows={setNewDraftRows}
          isCreatingVersion={isCreatingVersion}
          onCreateVersion={onCreateVersion}
          onCreated={(createdId) => setOpenVersionId(createdId)}
          headingId={newDraftHeadingId}
        />
      ) : null}

      {/* ── The opened version ── */}
      {openVersionId !== null ? (
        <OptionSetOpenedVersionSection
          openVersion={openVersion}
          isLoading={versionQuery.isLoading}
          isError={versionQuery.isError}
          onRetry={() => versionQuery.refetch()}
          editor={editor}
          tableRows={tableRows}
          handleTableChange={handleTableChange}
          isOpenVersionEditable={isOpenVersionEditable}
          openVersionReadOnlyNote={openVersionReadOnlyNote}
          publishRefusal={publishRefusal}
          isPublishing={isPublishing}
          onOpenPublishDialog={(v) => setPendingPublish(v)}
          describeRefusal={describeRefusal}
          openHeadingId={openHeadingId}
        />
      ) : null}

      <OptionSetPublishDialog
        pendingPublish={pendingPublish}
        currentPublishedVersionNumber={set?.publishedVersionNumber}
        isPublishing={isPublishing}
        onConfirm={handleConfirmPublish}
        onOpenChange={(open) => {
          if (!open) setPendingPublish(null);
        }}
      />
    </section>
  );
}
