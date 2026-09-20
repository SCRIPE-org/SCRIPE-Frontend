"use client";

import React from "react";
import { EntityReferenceCustomFieldControl } from "../controls/EntityReference/EntityReferenceCustomFieldControl";
import { MediaReferenceCustomFieldControl } from "../controls/MediaReference/MediaReferenceCustomFieldControl";
import { RichTextCustomFieldControl } from "../controls/RichText/RichTextCustomFieldControl";
import {
  isEntityReferenceValue,
  isRichTextValue,
  type CustomFieldEntityReferenceValue,
  type CustomFieldRichTextValue,
} from "../../../../custom-field-value/src/domain/entities/CustomFieldValue";
import { isFieldRequired } from "@core/ui/forms/generic-form";
import type { CustomFieldControlProps } from "./renderCustomFieldControlProps";

/**
 * Complex Controls Renderer
 * Handles entity references, media files/images, and rich text editors.
 */
export function renderComplexControls({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
  error,
}: CustomFieldControlProps): React.ReactNode | null {
  const isRequired = isFieldRequired(fc);

  if (fc.type === "entity-reference") {
    const reference: CustomFieldEntityReferenceValue | null = isEntityReferenceValue(value)
      ? value
      : null;
    const pinnedTarget = fc.referenceTargetEntityTypeKey?.trim() || null;
    return (
      <EntityReferenceCustomFieldControl
        key={fc.name}
        id={fc.name}
        label={fc.label ?? fc.name}
        targetEntityTypeKey={pinnedTarget ?? reference?.entityTypeKey ?? null}
        value={reference}
        onChange={(next) => onChange(next)}
        required={isRequired}
        disabled={isViewMode}
        placeholder={fc.placeholder}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  if (fc.type === "media-file" || fc.type === "media-image") {
    const reference: CustomFieldEntityReferenceValue | null = isEntityReferenceValue(value)
      ? value
      : null;
    const pinnedTarget = fc.referenceTargetEntityTypeKey?.trim() || null;
    return (
      <MediaReferenceCustomFieldControl
        key={fc.name}
        id={fc.name}
        label={fc.label ?? fc.name}
        targetEntityTypeKey={pinnedTarget ?? reference?.entityTypeKey ?? null}
        imagesOnly={fc.type === "media-image"}
        value={reference}
        onChange={(next) => onChange(next)}
        required={isRequired}
        disabled={isViewMode}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  if (fc.type === "rich-text") {
    const rich: CustomFieldRichTextValue | null = isRichTextValue(value) ? value : null;
    return (
      <RichTextCustomFieldControl
        key={fc.name}
        id={fc.name}
        label={fc.label ?? fc.name}
        value={rich}
        onChange={(next) => onChange(next)}
        required={isRequired}
        disabled={isViewMode}
        placeholder={fc.placeholder}
        invalid={invalid}
        describedBy={describedBy}
        error={error}
      />
    );
  }

  return null;
}
