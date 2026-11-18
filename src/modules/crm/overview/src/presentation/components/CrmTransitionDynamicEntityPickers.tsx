"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Label } from "@core/ui/label";
import { CrmEntitySearchSelect } from "./CrmEntitySearchSelect";
import {
  buildTransitionQuickCreateDefaults,
  type CrmWorkflowTransitionFormData,
  type TransitionDialogFlags,
  type TransitionRecordContext,
} from "./crmTransitionTypes";

interface CrmTransitionDynamicEntityPickersProps {
  flags: TransitionDialogFlags;
  record: TransitionRecordContext | null;
  accountFilterId?: string;
  control: Control<CrmWorkflowTransitionFormData>;
  errors: FieldErrors<CrmWorkflowTransitionFormData>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** Renders Account, Contact, and Owner search pickers required by workflow transition gates. */
export function CrmTransitionDynamicEntityPickers({
  flags,
  record,
  accountFilterId,
  control,
  errors,
  t,
}: CrmTransitionDynamicEntityPickersProps) {
  return (
    <>
      {flags.needsAccountId && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.accountLabel")}{" "}
            {flags.requireAccountId && <span className="text-destructive">*</span>}
          </Label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <CrmEntitySearchSelect
                entityKind="account"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                initialLabel={record?.accountDisplayName}
                enableQuickCreate
                quickCreateInitialValues={buildTransitionQuickCreateDefaults(record, "account")}
                required={flags.requireAccountId}
                invalid={Boolean(errors.accountId)}
                data-testid="crm-transition-account-select"
              />
            )}
          />
          {errors.accountId && <p className="text-[11px] text-destructive">{errors.accountId.message}</p>}
        </div>
      )}

      {flags.needsContactId && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.contactLabel")}{" "}
            {flags.requireContactId && <span className="text-destructive">*</span>}
          </Label>
          <Controller
            control={control}
            name="contactId"
            render={({ field }) => (
              <CrmEntitySearchSelect
                entityKind="contact"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                initialLabel={record?.contactDisplayName || record?.primaryContactName}
                accountId={accountFilterId || record?.accountId || undefined}
                enableQuickCreate
                quickCreateInitialValues={buildTransitionQuickCreateDefaults(record, "contact")}
                required={flags.requireContactId}
                invalid={Boolean(errors.contactId)}
                data-testid="crm-transition-contact-select"
              />
            )}
          />
          {errors.contactId && <p className="text-[11px] text-destructive">{errors.contactId.message}</p>}
        </div>
      )}

      {flags.needsOwnerUserId && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("crm.transitionDialog.ownerUserLabel")}{" "}
            {flags.requireOwnerUserId && <span className="text-destructive">*</span>}
          </Label>
          <Controller
            control={control}
            name="ownerUserId"
            render={({ field }) => (
              <CrmEntitySearchSelect
                entityKind="user"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                initialLabel={record?.ownerDisplayName}
                required={flags.requireOwnerUserId}
                invalid={Boolean(errors.ownerUserId)}
                data-testid="crm-transition-owner-select"
              />
            )}
          />
          {errors.ownerUserId && <p className="text-[11px] text-destructive">{errors.ownerUserId.message}</p>}
        </div>
      )}
    </>
  );
}
