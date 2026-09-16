/**
 * Standardized Custom Fields Form Section Component
 *
 * A single, reusable presentation component for rendering custom fields inside any host form
 * (e.g. Webhook Form, Lead Form, Template Form, Theme Modal, etc.).
 *
 * Handles:
 * - Dynamic field visibility rule evaluation
 * - Delegated control rendering via renderCustomFieldControl
 * - Empty state feedback
 * - Inline "Add Custom Field" trigger integration
 */
"use client";

import React from "react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";
import { renderCustomFieldControl } from "../form/renderCustomFieldControl";

export interface CustomFieldsSectionProps {
  /** The field configuration schemas (from useEntityCustomFields or ViewModel). */
  configs: readonly FieldConfig[];
  /** Current custom field values dictionary. */
  values: Record<string, unknown>;
  /** Callback fired whenever any custom field value changes. */
  onChange: (key: string, value: unknown) => void;
  /** Whether custom field definitions are currently loading. */
  isLoading?: boolean;
  /** Message displayed when no custom fields are defined for this entity type. */
  emptyMessage?: string;
  /** Entity type key (e.g. 'integrations.webhook-subscription') for inline creation. */
  entityTypeKey?: string;
  /** Localized entity display name for the inline creation modal title. */
  entityDisplayName?: string;
  /** Callback to refetch custom fields when an inline field is created. */
  onFieldCreated?: () => void;
  /** Whether the controls are in read-only / view mode. */
  isViewMode?: boolean;
  /** Optional container CSS class name. */
  className?: string;
}

export const CustomFieldsSection = React.memo(function CustomFieldsSection({
  configs,
  values,
  onChange,
  isLoading = false,
  emptyMessage,
  entityTypeKey,
  entityDisplayName,
  onFieldCreated,
  isViewMode = false,
  className = "space-y-5",
}: CustomFieldsSectionProps) {
  // Evaluate dynamic visibility rules for each field config against current form state
  const visibleConfigs = configs.filter((fc) => !fc.isVisible || fc.isVisible(values));

  const api = getCustomFieldsExtension();
  const InlineAddTrigger = api?.InlineAddTrigger;

  return (
    <div className={className}>
      {visibleConfigs.map((fc) => {
        const value = values[fc.name] ?? fc.defaultValue ?? "";
        return renderCustomFieldControl({
          fc,
          value,
          onChange: (v) => onChange(fc.name, v),
          isViewMode,
        });
      })}

      {configs.length === 0 && !isLoading && emptyMessage && (
        <p className="text-sm text-nx-ink-2">{emptyMessage}</p>
      )}

      {!isViewMode && InlineAddTrigger && entityTypeKey && entityDisplayName && onFieldCreated && (
        <InlineAddTrigger
          entityTypeKey={entityTypeKey}
          entityDisplayName={entityDisplayName}
          onCreated={onFieldCreated}
        />
      )}
    </div>
  );
});
