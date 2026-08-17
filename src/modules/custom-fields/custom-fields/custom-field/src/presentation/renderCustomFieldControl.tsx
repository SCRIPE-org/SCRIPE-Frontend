"use client";

/**
 * Shared per-type EDIT control renderer -- Wave 2 Step 2.2, Task 2.
 *
 * Ports the Text/Number/Boolean branches of the identical switch statement
 * duplicated across 8 consumer sites (WebhookFormCustomFieldsSection.tsx,
 * CreateLeadCustomFieldsSection.tsx, FeatureDefinitionFormView.tsx and 5
 * siblings) into ONE function every site will call starting Task 7. Select
 * (Task 3) and Date (Task 4) are intentionally not handled yet -- see the
 * placeholder comment below.
 *
 * Cross-checked byte-for-byte against WebhookFormCustomFieldsSection.tsx and
 * CreateLeadCustomFieldsSection.tsx before porting: both sites' Text/Number
 * (fallthrough Input branch) and Boolean (Switch branch) JSX are identical
 * (same className, same prop set, same toFieldInputValue helper) modulo the
 * update-callback identifier name (`vm.updateCustomFieldValue` vs
 * `onCustomFieldChange`), which this shared renderer already abstracts away
 * via the `onChange` prop. No drift found between the two sites for these 3
 * types.
 *
 * Placed flat in presentation/ (no `registry/` subfolder), matching Task 1's
 * valueTypeRegistry.ts -- this codebase has no `presentation/registry/`
 * convention anywhere (see that file's own header comment for the precedent
 * survey: subscriptions' constants.ts, signin's layouts/index.ts, settings'
 * settings-nav.tsx).
 */
import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type { FieldConfig } from "@core/ui/forms/generic-form";

export interface CustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  /** D9: FeatureDefinitionFormView.tsx needs this from day one, not bolted on later. */
  isViewMode?: boolean;
}

/** Ported verbatim from the 8 duplicated consumer sites' own toFieldInputValue helper. */
function toFieldInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

/**
 * The shared per-type edit control every consumer site (WebhookFormCustomFieldsSection.tsx
 * and 7 siblings) calls instead of hand-rolling its own switch (Wave 2 Step 2.2, D3). Keyed
 * on FieldConfig["type"], the vocabulary every site already receives via
 * customFieldsCrudIntegration.tsx's VALUE_TYPE_TO_FIELD_TYPE -- see the governing pre-plan
 * analysis for why this key was chosen over the raw CustomFieldValueTypeName.
 *
 * isViewMode's mechanism is NOT the same for both control families, and this function
 * reproduces FeatureDefinitionFormView.tsx's real, already-shipped behavior rather than a
 * uniform-looking guess (re-verified against @core/ui/switch.tsx and @core/ui/input.tsx
 * source, and against every isViewMode usage in FeatureDefinitionFormView.tsx itself,
 * including its own custom-field-loop Switch/Input branches):
 *  - Switch -> `readOnly` (NOT `disabled`). switch.tsx defines `readOnly` as a first-class
 *    prop distinct from `disabled`: it blocks the change while keeping the control focusable
 *    and its live colours ("Not the same as `disabled`" per that prop's own doc comment).
 *    FeatureDefinitionFormView.tsx's Status Switch and its custom-field Switch branch both
 *    use `readOnly={isViewMode}`.
 *  - Input (text/number fallthrough) -> `disabled` (NOT `readOnly`). Every Input instance in
 *    FeatureDefinitionFormView.tsx, including its own custom-field Input branch, uses
 *    `disabled={isViewMode}`. (Input does genuinely support a styled `readOnly` -- see
 *    input.tsx's READ_ONLY_FIELD -- but that is not the mechanism this reference site uses.)
 */
export function renderCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
}: CustomFieldControlProps): React.ReactNode {
  if (fc.type === "switch") {
    return (
      <div key={fc.name} className="flex items-center justify-between">
        <Label htmlFor={fc.name} className="text-sm font-medium">
          {fc.label}
        </Label>
        <Switch
          id={fc.name}
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          readOnly={isViewMode}
        />
      </div>
    );
  }

  // Select is Task 3 -- this task intentionally does not handle fc.type === "select" yet.
  // Date is Task 4.

  return (
    <div key={fc.name} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
      </Label>
      <Input
        id={fc.name}
        type={fc.type === "number" ? "number" : "text"}
        value={toFieldInputValue(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fc.placeholder}
        required={fc.required}
        disabled={isViewMode}
        className="text-sm"
      />
    </div>
  );
}
