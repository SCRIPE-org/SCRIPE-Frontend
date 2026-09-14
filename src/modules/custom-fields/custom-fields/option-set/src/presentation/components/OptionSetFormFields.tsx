"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
import { Globe2 } from "lucide-react";
import type { OptionSet } from "../../domain/entities/OptionSet";

export const OPTION_SET_STABLE_KEY_MAX_LENGTH = 100;
export const OPTION_SET_LABEL_MAX_LENGTH = 200;
export const OPTION_SET_DESCRIPTION_MAX_LENGTH = 1000;
export const STABLE_KEY_PATTERN = "[a-z][a-z0-9_\\-]*";

export interface OptionSetFormFieldsProps {
  fieldId: string;
  optionSet: OptionSet | null;
  stableKey: string;
  setStableKey: (value: string) => void;
  labelEn: string;
  setLabelEn: (value: string) => void;
  labelAr: string;
  setLabelAr: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  isGlobal: boolean;
  setIsGlobal: (value: boolean) => void;
  canChooseScope: boolean;
  isPlatformContext: boolean;
  isSaving: boolean;
}

export function OptionSetFormFields({
  fieldId,
  optionSet,
  stableKey,
  setStableKey,
  labelEn,
  setLabelEn,
  labelAr,
  setLabelAr,
  description,
  setDescription,
  isGlobal,
  setIsGlobal,
  canChooseScope,
  isPlatformContext,
  isSaving,
}: OptionSetFormFieldsProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {optionSet !== null ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-nx-ink-2">
              {t("optionSet.fields.stableKey")}
            </span>
            <code
              className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-1.5 font-mono text-sm text-nx-ink"
              dir="ltr"
            >
              {optionSet.stableKey}
            </code>
            <p className="text-xs text-nx-ink-3">{t("optionSet.immutable.stableKey")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-stableKey`}>{t("optionSet.fields.stableKey")}</Label>
            <Input
              id={`${fieldId}-stableKey`}
              value={stableKey}
              onChange={(event) => setStableKey(event.target.value.toLowerCase())}
              required
              maxLength={OPTION_SET_STABLE_KEY_MAX_LENGTH}
              pattern={STABLE_KEY_PATTERN}
              placeholder={t("optionSet.placeholders.stableKey")}
              disabled={isSaving}
              dir="ltr"
              aria-describedby={`${fieldId}-stableKey-hint`}
            />
            <p id={`${fieldId}-stableKey-hint`} className="text-xs text-nx-ink-3">
              {t("optionSet.fields.stableKeyHint")}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-labelEn`}>{t("optionSet.fields.labelEn")}</Label>
          <Input
            id={`${fieldId}-labelEn`}
            value={labelEn}
            onChange={(event) => setLabelEn(event.target.value)}
            required
            maxLength={OPTION_SET_LABEL_MAX_LENGTH}
            placeholder={t("optionSet.placeholders.labelEn")}
            disabled={isSaving}
            dir="auto"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${fieldId}-labelAr`}>{t("optionSet.fields.labelAr")}</Label>
          <Input
            id={`${fieldId}-labelAr`}
            value={labelAr}
            onChange={(event) => setLabelAr(event.target.value)}
            maxLength={OPTION_SET_LABEL_MAX_LENGTH}
            placeholder={t("optionSet.placeholders.labelAr")}
            disabled={isSaving}
            dir="auto"
          />
        </div>

        {optionSet !== null ? (
          optionSet.isPlatformOwned && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-nx-ink-2">
                {t("optionSet.fields.isGlobal")}
              </span>
              <div>
                <Badge variant="info" className="gap-1">
                  <Globe2 className="h-3 w-3" aria-hidden="true" />
                  {t("optionSet.badge.platformOwned")}
                </Badge>
              </div>
              <p className="text-xs text-nx-ink-3">{t("optionSet.immutable.isGlobal")}</p>
            </div>
          )
        ) : canChooseScope && (
          isPlatformContext ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-nx-ink-2">
                {t("optionSet.fields.isGlobal")}
              </span>
              <div>
                <Badge variant="info" className="gap-1">
                  <Globe2 className="h-3 w-3" aria-hidden="true" />
                  {t("optionSet.badge.platformOwned")}
                </Badge>
              </div>
              <p className="text-xs text-nx-ink-3">
                {t("optionSet.isGlobalDescription.platformContext")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${fieldId}-isGlobal`}>{t("optionSet.fields.isGlobal")}</Label>
              <Switch
                id={`${fieldId}-isGlobal`}
                checked={isGlobal}
                onCheckedChange={setIsGlobal}
                disabled={isSaving}
                aria-describedby={`${fieldId}-isGlobal-hint`}
              />
              <p id={`${fieldId}-isGlobal-hint`} className="text-xs text-nx-ink-3">
                {t("optionSet.isGlobalDescription.tenantContext")}
              </p>
            </div>
          )
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${fieldId}-description`}>{t("optionSet.fields.description")}</Label>
        <Textarea
          id={`${fieldId}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={OPTION_SET_DESCRIPTION_MAX_LENGTH}
          placeholder={t("optionSet.placeholders.description")}
          disabled={isSaving}
          rows={3}
          dir="auto"
          aria-describedby={`${fieldId}-description-hint`}
        />
        <p id={`${fieldId}-description-hint`} className="text-xs text-nx-ink-3">
          {t("optionSet.fields.descriptionHint")}
        </p>
      </div>
    </>
  );
}
