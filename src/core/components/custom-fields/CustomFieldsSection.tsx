"use client";

import React from "react";
import {
  getCustomFieldsExtension,
  type CustomFieldsSectionProps,
} from "@core/crud/customFieldsExtension";
import { CustomFieldsSection as DefaultSection } from "@/modules/custom-fields/custom-fields/custom-field/src/presentation/components/CustomFieldsSection";

export type { CustomFieldsSectionProps };

export const CustomFieldsSection = React.memo(function CustomFieldsSection(
  props: CustomFieldsSectionProps
) {
  const api = getCustomFieldsExtension();
  const Section = api?.Section ?? DefaultSection;

  if (!Section) {
    if (props.configs.length === 0 && !props.isLoading && props.emptyMessage) {
      return <p className="text-sm text-nx-ink-2">{props.emptyMessage}</p>;
    }
    return null;
  }

  return <Section {...props} />;
});
