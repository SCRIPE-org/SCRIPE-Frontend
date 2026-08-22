/**
 * Option Sets admin screen -- P-4 (shared option sets)
 *
 * `/custom-fields/option-sets`. Lists every option set this caller can see, creates and renames them,
 * and hands the selected one to `OptionSetDetailPanel` for its version chain.
 *
 * An option set is a NAMED, VERSIONED list of choices that Select and MultiSelect fields bind to,
 * instead of every field carrying its own inline option list. Nothing on this screen edits a set's
 * CHOICES: choices live in versions, and versions live in the panel.
 *
 * PAGE SHAPE, decided the same way rows 5.2 and 5.4 decided theirs
 * ---------------------------------------------------------------
 * NOT a `CrudConfig` over `GenericCrudView`. `GET /custom-fields/option-sets` returns a BARE ARRAY --
 * no pagination envelope, no search parameter, no sort parameter -- so `useCrudViewModel`, which is
 * built around page/pageSize/totalCount, would have to be fed fabricated pagination metadata and
 * would contribute a pager over a single page plus a search box the API cannot honour. `PageHeader`
 * over a real `<table>` (the primitive `EntityTypeCatalogView` and `ValueTypeCatalogView` already use
 * for equivalent flat reference content) is the honest shape.
 *
 * WHY THE SET FORM IS A DIALOG WHILE FIELD GROUPS USE AN INLINE PANEL
 * ------------------------------------------------------------------
 * `FieldGroupEditor` is inline because Wave 5 row 5.6 removed nested-modal focus traps from this
 * module. That reasoning is about NESTING, and it still holds: `OptionSetEditorDialog` is a top-level
 * overlay over this route with no modal above it and no portaled combobox inside it -- the same
 * position `FieldHistoryDialog` occupies over the definitions screen. The screen's own second surface
 * (the detail panel) is deliberately NOT a dialog for exactly the row 5.6 reason: it hosts the
 * options table, which hosts its own publish confirmation.
 *
 * READ-ONLY SETS GET AN EXPLANATION, NEVER A DISABLED BUTTON
 * ---------------------------------------------------------
 * Two different facts make a set read-only and they need different sentences:
 *
 *   - `isSystemManaged` -- the platform maintains it (the seeded ISO 3166 / ISO 4217 / BCP 47 lists).
 *     All five mutating endpoints refuse it for EVERY caller, Super Admin included.
 *   - `isPlatformOwned` from tenant context -- readable and bindable by design, writable only from
 *     platform context.
 *
 * Both are badged in the Scope column here, and both cost the row its Edit and Delete controls
 * outright rather than greying them. The sentence that says WHY is rendered where the missing controls
 * would have been -- `OptionSetDetailPanel` puts `optionSet.readOnly.*` above the version chain, and
 * `OptionSetEditorDialog` renders the same explanation in place of its form if it is ever opened on
 * one. A control that refuses without saying why reads as a defect; three layers say why.
 *
 * PERMISSIONS: every action is gated on the viewmodel's resolved booleans, which come from
 * `usePermissions()` inside `useOptionSetViewModel` -- six distinct backend keys, not one, because
 * `.publish` and `.bind` are separate actions from the CRUD quartet. Gating here off the viewmodel
 * rather than off a second `usePermissions()` call is what keeps a hidden control and a refused write
 * reading from the same source.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { SectionState } from "@core/ui/section-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { ChevronLeft, ChevronRight, Globe2, Layers, Lock, Plus, X } from "lucide-react";
import { useOptionSetViewModel } from "../viewmodels/useOptionSetViewModel";
import {
  OptionSetEditorDialog,
  type OptionSetEditorReadOnlyReason,
  type OptionSetEditorSubmission,
} from "../components/OptionSetEditorDialog";
import { OptionSetDetailPanel } from "./OptionSetDetailPanel";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";

/**
 * Maps a viewmodel refusal to the editor dialog's narrower vocabulary.
 *
 * The viewmodel's `OptionSetRefusalReason` covers version-level states (`notDraft`,
 * `alreadyPublished`, `emptyVersion`, ...) that a metadata form cannot hit; the dialog knows only the
 * three that can make a SET read-only. Anything else returns null, which leaves the dialog showing
 * its form -- correct, because a reason outside these three is not a reason this form is blocked.
 */
function toEditorReadOnlyReason(reason: string | undefined): OptionSetEditorReadOnlyReason | null {
  if (reason === "systemManaged" || reason === "platformOwned" || reason === "permission") {
    return reason;
  }
  return null;
}

/**
 * Presentation UI component rendering the Option Sets admin screen.
 *
 * Layout, permission-gated affordances and accessible table semantics only -- every read, write, gate
 * and refusal lives in `useOptionSetViewModel`, and every version-level concern lives in
 * `OptionSetDetailPanel`.
 */
export function OptionSetListView() {
  useModuleLocales(() => import("../../../locales"), "customFieldOptionSets");
  const { t, language, direction } = useI18n();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  /**
   * The selected set's id, owned by the SCREEN and passed into the viewmodel.
   *
   * Same contract as `useFieldGroupViewModel(entityTypeKey)`: the hook does not own the selection, so
   * a future route-param version of this page (`/option-sets/[id]`) can drive it without the hook
   * changing at all. `null` keeps the detail query idle rather than firing an id-less read.
   */
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OptionSet | null>(null);

  const vm = useOptionSetViewModel(selectedSetId);

  /**
   * The set the dialog is editing, resolved from the list.
   *
   * Deliberately null while creating, and deliberately re-derived rather than snapshotted: this is the
   * value that decides whether the dialog renders its create form or its edit form. Row 5.2 shipped
   * the bug this guards against -- a panel above a live list kept its "Edit" heading after the edited
   * row vanished, and Save took the create branch and wrote a row nobody asked for. Here the fix is
   * structural: if the row goes, `isEditorOpen` goes false and the dialog closes, so there is no
   * frame in which an edit form can flip to a create form under the admin's hands.
   */
  const editorTarget = vm.editingId !== null ? vm.editingSet : null;
  const isEditorOpen = vm.isCreating || editorTarget !== null;

  /** The refusal that would block a rename of the set being edited, for the dialog's read-only arm. */
  const editorReadOnlyReason = useMemo(
    () => (editorTarget ? toEditorReadOnlyReason(vm.refuseUpdate(editorTarget)?.reason) : null),
    [editorTarget, vm]
  );

  const handleSubmit = useCallback(
    async (submission: OptionSetEditorSubmission) => {
      // Branching on the SUBMISSION's own tag, not on whether a set happens to be resolvable. The tag
      // is set by the arm of the form that produced it, so an "edit" submission can never take the
      // create path even if the row disappeared between render and save.
      if (submission.mode === "edit") {
        if (!editorTarget) {
          // The row went away mid-edit. Closing is the honest outcome: there is nothing to update, and
          // creating a new set from an edit form is the failure this branch exists to prevent.
          vm.closeEditor();
          return;
        }
        const updated = await vm.updateSet(editorTarget, {
          labelEn: submission.labelEn,
          labelAr: submission.labelAr.length > 0 ? submission.labelAr : null,
          description: submission.description.length > 0 ? submission.description : null,
        });
        // Only on success: a refused save leaves the dialog open with the admin's input intact, and
        // the viewmodel's own toast has already said why.
        if (updated) vm.closeEditor();
        return;
      }

      const createdId = await vm.createSet({
        // Create-only, both of them. `UpdateOptionSetRequest` carries neither, and the edit arm of the
        // submission union has no property for either -- so there is nothing to forward by accident.
        stableKey: submission.stableKey,
        labelEn: submission.labelEn,
        labelAr: submission.labelAr.length > 0 ? submission.labelAr : null,
        description: submission.description.length > 0 ? submission.description : null,
        isGlobal: submission.isGlobal,
      });
      if (createdId === null) return;

      vm.closeEditor();
      // Select the new set straight away: it has no versions yet, and the panel's "create draft
      // version" affordance is the only next step that makes it usable by a field.
      setSelectedSetId(createdId);
    },
    [editorTarget, vm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const deletedId = pendingDelete.id;

    const deleted = await vm.deleteSet(pendingDelete);
    if (!deleted) return;

    setPendingDelete(null);
    // The panel and the dialog both survive a delete performed from the row underneath them. Leaving
    // either open over a set that no longer exists offers controls for nothing.
    if (selectedSetId === deletedId) setSelectedSetId(null);
    if (vm.editingId === deletedId) vm.closeEditor();
  }, [pendingDelete, selectedSetId, vm]);

  /**
   * The two version-level gates, bound to the selected set for the panel.
   *
   * Bound here rather than inside the panel because the gates are the viewmodel's and take the set:
   * a panel that re-derived them would be a second answer to "may this be published", and the two
   * would drift the first time a rule changed.
   */
  const createVersionRefusal = useMemo(
    () => (vm.selectedSet ? vm.refuseCreateVersion(vm.selectedSet) : null),
    [vm]
  );

  const refusePublishForSelected = useCallback(
    (version: OptionSetVersion) =>
      vm.selectedSet ? vm.refusePublish(vm.selectedSet, version) : null,
    [vm]
  );

  /**
   * The two version-level writes, bound to the selected set.
   *
   * Both resolve to the "did not happen" value when no set is loaded rather than throwing: the panel
   * only renders once a set is selected, so this arm is unreachable in practice, and a throw from an
   * unreachable arm is a crash waiting for a race the viewmodel already guards against.
   */
  const handleCreateVersion = useCallback(
    (items: OptionSetItemInput[]) =>
      vm.selectedSet ? vm.createVersion(vm.selectedSet, items) : Promise.resolve(null),
    [vm]
  );

  const handlePublishVersion = useCallback(
    (version: OptionSetVersion) =>
      vm.selectedSet ? vm.publishVersion(vm.selectedSet, version) : Promise.resolve(false),
    [vm]
  );

  /**
   * The selected set's label, or null while its detail has not landed.
   *
   * Read off the loaded set rather than remembered at click time: it is only used to qualify the
   * panel's close control, and a name held over from a previous selection would announce the wrong
   * set. Null means "not known yet", which the control below turns into no qualifier at all.
   */
  const selectedSetLabel = vm.selectedSet ? vm.selectedSet.displayLabel(language) : null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        icon={Layers}
        title={t("optionSet.title")}
        description={t("optionSet.description")}
        eyebrow={
          <Link href="/custom-fields">
            <Button variant="ghost" size="sm">
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          </Link>
        }
        actions={
          vm.canCreate && !isEditorOpen ? (
            <Button size="sm" onClick={vm.startCreate}>
              <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("optionSet.addNew")}
            </Button>
          ) : undefined
        }
      />

      {vm.isPlatformContext && (
        <Alert variant="info">
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("optionSet.platformContext.title")}</AlertTitle>
          <AlertDescription>{t("optionSet.platformContext.description")}</AlertDescription>
        </Alert>
      )}

      {!vm.canView ? (
        // The read is idle without `custom-field-option-sets.view`, so there is no error to show and
        // no list to show. Saying which permission is missing beats an empty table that looks broken.
        <EmptyState icon={Lock} title={t("optionSet.permissions.view")} />
      ) : vm.isSetsError ? (
        <ErrorMessage message={t("optionSet.loadFailed")} onRetry={() => vm.refetchSets()} />
      ) : (
        <SectionState
          isLoading={vm.isSetsLoading}
          skeletonType="rows"
          skeletonRows={6}
          // Empty is handled below rather than by SectionState, whose empty branch takes a single
          // message: `optionSet.noItems` is a title AND a description, and the description is the half
          // that explains when a set is worth creating at all.
          isEmpty={false}
        >
          {vm.sets.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={t("optionSet.noItems.title")}
              description={t("optionSet.noItems.description")}
              action={
                vm.canCreate ? (
                  <Button size="sm" onClick={vm.startCreate}>
                    <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                    {t("optionSet.addNew")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-nx-md border border-nx-line">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("optionSet.columns.label")}</TableHead>
                    <TableHead>{t("optionSet.columns.stableKey")}</TableHead>
                    <TableHead>{t("optionSet.columns.description")}</TableHead>
                    <TableHead>{t("optionSet.columns.scope")}</TableHead>
                    <TableHead>{t("optionSet.columns.versions")}</TableHead>
                    <TableHead>{t("optionSet.columns.publishedVersion")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vm.sets.map((set) => {
                    const label = set.displayLabel(language);
                    // The OTHER language's label, shown beneath the primary one so a bilingual set is
                    // legible from either locale. `displayLabel` already falls back to `labelEn`, so
                    // this is only rendered when the two are genuinely different values.
                    const secondaryLabel =
                      language === "ar"
                        ? set.labelEn !== label
                          ? set.labelEn
                          : null
                        : set.labelAr && set.labelAr !== label
                          ? set.labelAr
                          : null;
                    const canUpdate = vm.canUpdateSet(set);
                    const canDelete = vm.canDeleteSet(set);
                    const isSelected = selectedSetId === set.id;

                    return (
                      <TableRow key={set.id} data-state={isSelected ? "selected" : undefined}>
                        <TableCell className="align-top">
                          {/* The label IS the select control. One affordance per row, whose accessible
                              name is the set's own name -- so N rows are N distinguishable controls
                              without a row number bolted onto a generic "Open". */}
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-start font-medium"
                            onClick={() => setSelectedSetId(set.id)}
                            aria-pressed={isSelected}
                          >
                            {label}
                          </Button>
                          {secondaryLabel ? (
                            <p className="text-xs text-nx-ink-3">{secondaryLabel}</p>
                          ) : null}
                        </TableCell>

                        <TableCell className="align-top">
                          {/* Always LTR and monospaced: the key is a machine identifier that exports,
                              imports and bindings all match on, not translated copy. */}
                          <span className="font-mono text-xs text-nx-ink-2" dir="ltr">
                            {set.stableKey}
                          </span>
                        </TableCell>

                        <TableCell className="align-top text-sm text-nx-ink-2">
                          {set.description ?? (
                            <span className="text-nx-ink-3">{t("common.none")}</span>
                          )}
                        </TableCell>

                        <TableCell className="align-top">
                          {/* Two badges for two different facts, and NO badge for an ordinary
                              tenant-owned set. A chip on every row would make the handful that are
                              off limits harder to spot, which is the same call EntityTypeCatalogView
                              makes by giving its uninteresting state the quietest tone. */}
                          <div className="flex flex-wrap gap-1">
                            {set.isSystemManaged ? (
                              <Badge variant="warning">{t("optionSet.badge.systemManaged")}</Badge>
                            ) : null}
                            {set.isPlatformOwned ? (
                              <Badge variant="info">{t("optionSet.badge.platformOwned")}</Badge>
                            ) : null}
                          </div>
                        </TableCell>

                        <TableCell className="align-top text-sm tabular-nums text-nx-ink-2">
                          {t("optionSet.values.versionCount", { count: set.versionCount })}
                        </TableCell>

                        <TableCell className="align-top text-sm">
                          {/* A set with versions but nothing published is a real, common state -- a
                              draft nobody published -- and no field can bind to it. The cell says so
                              instead of being left empty. */}
                          {set.publishedVersionNumber !== null ? (
                            <Badge variant="success">
                              {t("optionSet.values.publishedVersionNumber", {
                                number: set.publishedVersionNumber,
                              })}
                            </Badge>
                          ) : (
                            <span className="text-nx-ink-3">
                              {t("optionSet.values.noPublishedVersion")}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-end align-top">
                          {/* Nothing is rendered greyed. A read-only set loses these controls
                              entirely, and the sentence that explains it is in the panel and in the
                              dialog -- see the file header. */}
                          <div className="flex items-center justify-end gap-1">
                            {canUpdate ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => vm.startEdit(set.id)}
                                // Row-qualified by the set's own name: "Edit" repeated on every row
                                // leaves a screen-reader user with identical buttons and no way to
                                // tell them apart.
                                aria-label={`${t("common.edit")} ${label}`}
                              >
                                {t("common.edit")}
                              </Button>
                            ) : null}
                            {canDelete ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => setPendingDelete(set)}
                                aria-label={`${t("common.delete")} ${label}`}
                              >
                                {t("common.delete")}
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionState>
      )}

      {selectedSetId !== null && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSetId(null)}
              // WCAG 2.5.3 (Label in Name): the announced name CONTAINS the visible word and leads
              // with it, prefixing exactly as the row actions above do. The previous
              // `optionSet.backToList` REPLACED the visible text, so the control read "Close" and
              // announced "Back to option sets" -- unreachable by voice control ("click Close") and
              // describing an action this button does not perform: the list is still rendered above,
              // this only dismisses the panel. Qualified by the set so the name says WHICH panel
              // closes, and left unqualified until the detail lands, because a stale set name here
              // would be worse than a bare "Close".
              aria-label={selectedSetLabel ? `${t("common.close")} ${selectedSetLabel}` : undefined}
            >
              <X className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {t("common.close")}
            </Button>
          </div>

          <OptionSetDetailPanel
            // Keyed on the set id so the panel's own state -- which version is open, any half-typed
            // new draft -- cannot survive a change of set. Carrying either across would put one set's
            // options under another set's heading, and that is the state a save writes from.
            key={selectedSetId}
            set={vm.selectedSet}
            versions={vm.versions}
            isLoading={vm.isDetailLoading}
            isError={vm.isDetailError}
            onRetry={() => void vm.refetchDetail()}
            createVersionRefusal={createVersionRefusal}
            refusePublish={refusePublishForSelected}
            describeRefusal={vm.describeRefusal}
            onCreateVersion={handleCreateVersion}
            onPublishVersion={handlePublishVersion}
            isCreatingVersion={vm.isCreatingVersion}
            isPublishing={vm.isPublishing}
          />
        </div>
      )}

      <OptionSetEditorDialog
        // Remounts when the target changes, so the form's internal state is re-seeded from the new set
        // rather than keeping the previous row's values. Keyed on the id, never on the resolved
        // entity: a refetch that replaces the instance must not blank out what the admin has typed.
        key={vm.editingId ?? "create"}
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) vm.closeEditor();
        }}
        optionSet={editorTarget}
        readOnlyReason={editorReadOnlyReason}
        // Only a Super Admin may ASK for a global set; the backend re-checks and 403s anyone else who
        // sends it, so this gate is about not offering a control whose answer is already known.
        canChooseScope={vm.isSuperAdmin}
        isPlatformContext={vm.isPlatformContext}
        isSaving={vm.isSaving}
        // Null on purpose. The viewmodel's mutations report their own failures through toasts and do
        // not surface the server's message, so wiring a second channel here would either duplicate
        // the report or invent a sentence the server never sent.
        errorMessage={null}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        variant="destructive"
        title={t("optionSet.deleteTitle")}
        // Names the blast radius, because deleting a set is not like deleting a field group: the whole
        // version chain goes with it, and a field bound to one of those versions stops resolving its
        // choices. This sentence is the only chance an admin gets to stop.
        description={t("optionSet.deleteConfirm", {
          name: pendingDelete?.displayLabel(language) ?? "",
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={vm.isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
