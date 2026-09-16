/**
 * ViewModel hook for InlineAddCustomFieldDialog.
 * Encapsulates the field creation and optional option-set binding logic
 * away from the presentation view/sheet.
 */
"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { normalizeCustomFieldCreateScope } from "../../../../custom-field/src/presentation/form/customFieldScopeFieldConfig";
import { resolveActiveFieldVersion } from "../../../../custom-field/src/presentation/viewmodels/useOptionSetBindingViewModel";
import type { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

export interface CreateInlineFieldParams {
  data: Record<string, unknown>;
  entityTypeKey: string;
  bindableOptionSets: readonly OptionSet[];
  onSuccess: () => void;
}

export function useInlineAddCustomFieldViewModel() {
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createInlineCustomField = useCallback(
    async ({ data, entityTypeKey, bindableOptionSets, onSuccess }: CreateInlineFieldParams) => {
      setIsSubmitting(true);
      try {
        const { customFieldRepository, optionSetRepository } = getCustomFieldsContainer();
        const { optionSetId, ...rest } = data as Record<string, unknown> & {
          optionSetId?: string;
        };

        const fieldId = await customFieldRepository.create(
          normalizeCustomFieldCreateScope({
            ...rest,
            entityTypeKey,
            validatorKind: rest.validatorKind === "" ? null : rest.validatorKind,
            validatorParam: rest.validatorParam === "" ? null : rest.validatorParam,
          })
        );

        // Attach the chosen option set AFTER the field exists -- binding targets a
        // FieldVersionId, which only exists once the create handler has minted the
        // field's definition twin and Published version. The manual "options" this admin
        // may have just typed are kept: OptionSetBindingApplier.ApplyAsync preserves any
        // hand-authored option whose key doesn't collide with the set.
        if (optionSetId) {
          const chosen = bindableOptionSets.find((set) => set.id === optionSetId);
          if (chosen?.publishedVersionId) {
            try {
              const { versions } = await customFieldRepository.getVersions(fieldId);
              const active = resolveActiveFieldVersion(versions);
              if (active) {
                await optionSetRepository.bind(active.id, chosen.publishedVersionId);
              }
            } catch {
              // The field itself was created successfully -- this create flow must not
              // roll it back over a binding failure. The admin can attach the set from
              // the field's own "Option set" action afterward; the toast says so rather
              // than leaving them to notice the set silently never applied.
              toast.error({
                title: t("customField.optionSetBinding.attachAtCreateFailed"),
              });
            }
          }
        }

        onSuccess();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("common.error");
        toast.error({ title: message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [t]
  );

  return {
    createInlineCustomField,
    isSubmitting,
  };
}
