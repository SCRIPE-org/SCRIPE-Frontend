"use client";

/**
 * The CustomFields module's implementation of `CustomFieldsExtensionApi.FieldControl`
 * — the bridge that lets a plain `<GenericForm>` draw a custom field whose control
 * lives in this module.
 *
 * WHY THIS FILE EXISTS AT ALL, in one sentence: `core` may not import from
 * `src/modules/*` (docs/architecture/01-modularity.md's Dependency Rule), so
 * GenericForm cannot reach `EntityReferenceCustomFieldControl` directly, and the
 * registry that already carries `getFormFields`/`InlineAddTrigger`/
 * `formatValueForDisplay` across that line carries this too.
 *
 * WHAT IT DOES NOT DO is the interesting part. It holds no dispatch of its own: it
 * forwards to `renderCustomFieldControl`, the same per-type dispatcher all 8
 * hand-wired consumer sites already call. So there is exactly ONE table deciding
 * which control a custom-field type gets, and a type added there is drawn
 * identically whether the operator reached it through a hand-wired section or
 * through a generic CRUD screen's `<GenericForm>`. A second switch here — even a
 * one-armed one for `entity-reference` — is precisely the divergence that made the
 * generic screens render `[object Object]` while the hand-wired ones worked.
 *
 * WHY IT IS A COMPONENT AND NOT A PLAIN FUNCTION on the API. Two reasons, both
 * real: `InlineAddTrigger` already establishes `React.ComponentType` as the shape
 * for a module capability that renders (so this matches its registration path
 * exactly), and a component gives the drawn subtree its own stable position in the
 * host's element tree — the controls behind `renderCustomFieldControl` hold hook
 * state (open/draft/resolution), and a function called mid-render by the host would
 * make that state's identity depend on the host's own render structure.
 *
 * WHY `disabled` MAPS TO `isViewMode`. `renderCustomFieldControl`'s own contract
 * documents `isViewMode` as "this control is not operable now" and resolves it
 * per-control to `disabled` or `readOnly` as that control's own shipped behaviour
 * requires (Switch takes `readOnly`, Input takes `disabled`). GenericForm's
 * equivalent is its `inert` (`field.disabled || readOnly`) and it draws the same
 * distinction for the same reason — "pickers and toggles, which have nothing to
 * copy, go inert". Passing it through here keeps one decision in one place instead
 * of re-deciding per control on this side of the boundary.
 */
import React from "react";
import type { CustomFieldFormControlProps } from "@core/crud/customFieldsExtension";
import { renderCustomFieldControl } from "./renderCustomFieldControl";

/**
 * Draws one custom field — label, control and any hint the control owns — for a
 * host form that cannot import this module.
 *
 * Registered as `CustomFieldsExtensionApi.FieldControl` from
 * customFieldsCrudIntegration.tsx; never imported by `core`.
 *
 * @param props The host-owned facts about this field. See
 * `CustomFieldFormControlProps` in core/crud/customFieldsExtension.tsx for why the
 * contract is exactly these six values.
 * @returns The rendered field.
 */
export function GenericFormCustomFieldControl({
  field,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
  error,
}: CustomFieldFormControlProps): React.ReactElement {
  return (
    <>
      {renderCustomFieldControl({
        fc: field,
        value,
        onChange,
        isViewMode: disabled,
        invalid,
        describedBy,
        error,
      })}
    </>
  );
}
