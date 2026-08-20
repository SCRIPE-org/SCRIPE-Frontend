/**
 * FieldGroupEditor -- the create/edit form for a field group (Wave 5 row 5.2)
 *
 * Rendered INLINE on the Field Groups page, not in a dialog. Wave 5 row 5.6
 * (commit da4fb8cf) removed the nested-modal focus traps from this module's
 * flows, and three custom-fields screens are already routed as plain pages
 * with zero nesting. A four-input form does not need an overlay to justify
 * itself, and an inline panel cannot trap focus, cannot fight a portaled
 * dropdown, and needs no `modal={false}` escape hatch.
 *
 * WHAT THE EDIT FORM DOES NOT OFFER, deliberately:
 *   - `entityTypeKey` — immutable after creation; `UpdateFieldGroupRequest`
 *     has no such property.
 *   - `isGlobal` — tenant scope is a create-time decision, for the same reason
 *     CustomFieldListView omits it from ITS edit form: changing which tenants
 *     a live group applies to is a different feature, not a missing input.
 */
"use client";

import { useId, useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type { FieldGroup } from "../../domain/entities/FieldGroup";

export interface FieldGroupFormValues {
  /**
   * Immutable machine key (Wave 6 row 6.5). Meaningful on CREATE only — the update path does not
   * send it, because a schema re-import matches on this value and a rename would silently turn an
   * update into a create against a previously exported bundle.
   */
  stableKey: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  isGlobal: boolean;
}

export interface FieldGroupEditorLabels {
  heading: string;
  stableKey: string;
  stableKeyHint: string;
  labelEn: string;
  labelAr: string;
  sortOrder: string;
  isGlobal: string;
  isGlobalDescription: string;
  save: string;
  cancel: string;
}

export interface FieldGroupEditorProps {
  /** The group being edited, or null for a create. */
  group: FieldGroup | null;
  labels: FieldGroupEditorLabels;
  /** Only a Super Admin ever sees the scope switch; the backend re-checks. */
  canChooseScope: boolean;
  /** With no tenant selected the group is global regardless — shown on+inert. */
  isPlatformContext: boolean;
  isSaving: boolean;
  onSubmit: (values: FieldGroupFormValues) => void;
  onCancel: () => void;
}

export function FieldGroupEditor({
  group,
  labels,
  canChooseScope,
  isPlatformContext,
  isSaving,
  onSubmit,
  onCancel,
}: FieldGroupEditorProps) {
  const fieldId = useId();
  const isEdit = group !== null;

  const [stableKey, setStableKey] = useState(group?.stableKey ?? "");
  const [labelEn, setLabelEn] = useState(group?.labelEn ?? "");
  const [labelAr, setLabelAr] = useState(group?.labelAr ?? "");
  const [sortOrder, setSortOrder] = useState(String(group?.sortOrder ?? 0));
  const [isGlobal, setIsGlobal] = useState(isPlatformContext);

  return (
    <form
      className="flex flex-col gap-4 rounded-nx-md border border-nx-line bg-nx-raised p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (isSaving) return;
        onSubmit({
          // Already lowercase -- the input lowercases as it is typed, so the pattern attribute and
          // the submitted value can never disagree. Trimmed only.
          stableKey: stableKey.trim(),
          labelEn: labelEn.trim(),
          labelAr: labelAr.trim(),
          // An empty/garbage number input yields NaN, which would serialize to
          // null and fail the non-nullable SortOrder binding. Fall back to 0.
          sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
          isGlobal,
        });
      }}
    >
      <h2 className="text-sm font-semibold text-nx-ink">{labels.heading}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-stableKey`}>{labels.stableKey}</Label>
          <Input
            id={`${fieldId}-stableKey`}
            value={stableKey}
            onChange={(event) => setStableKey(event.target.value.toLowerCase())}
            required
            maxLength={100}
            // Mirrors the server's own regex on CreateFieldGroupRequest, so an invalid key is caught
            // before a round trip rather than after one.
            pattern="[a-z][a-z0-9_]*"
            // Read-only on edit, not hidden: the admin needs to SEE the key an export will carry, and
            // must not be able to change it. Hiding it would leave them unable to correlate a bundle
            // with the group it refers to.
            readOnly={isEdit}
            disabled={isEdit}
            dir="ltr"
          />
          <p className="text-xs text-nx-ink-subtle">{labels.stableKeyHint}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-labelEn`}>{labels.labelEn}</Label>
          <Input
            id={`${fieldId}-labelEn`}
            value={labelEn}
            onChange={(event) => setLabelEn(event.target.value)}
            required
            maxLength={200}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-labelAr`}>{labels.labelAr}</Label>
          <Input
            id={`${fieldId}-labelAr`}
            value={labelAr}
            onChange={(event) => setLabelAr(event.target.value)}
            maxLength={200}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-sortOrder`}>{labels.sortOrder}</Label>
          <Input
            id={`${fieldId}-sortOrder`}
            type="number"
            min={0}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
        </div>

        {/* Scope is create-time only — see this file's header comment. */}
        {!isEdit && canChooseScope && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-isGlobal`}>{labels.isGlobal}</Label>
            <Switch
              id={`${fieldId}-isGlobal`}
              checked={isGlobal}
              onCheckedChange={setIsGlobal}
              disabled={isPlatformContext}
            />
            <p className="text-xs text-nx-ink-3">{labels.isGlobalDescription}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSaving || labelEn.trim().length === 0 || stableKey.trim().length === 0}>
          {labels.save}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {labels.cancel}
        </Button>
      </div>
    </form>
  );
}
