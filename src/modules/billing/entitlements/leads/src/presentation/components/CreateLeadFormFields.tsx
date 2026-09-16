/**
 * CreateLeadFormFields — Form field controls for the Create Lead dialog.
 * Renders company, contact, email, phone, edition selector, and notes inputs.
 */

import React from "react";
import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@core/ui/form";
import { Input } from "@core/ui/input";
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CreateLeadFormValues } from "./CreateLeadDialogSchema";

/**
 * Props for the lead creation form fields component.
 */
export interface CreateLeadFormFieldsProps {
  /** React Hook Form controller */
  control: Control<CreateLeadFormValues>;
  /** Submission state disabling inputs during network operations */
  isSubmitting: boolean;
  /** Available platform editions available for customer subscription */
  availableEditions: Array<{ key: string; displayName: string }>;
  /** Localization translator function */
  t: (key: string) => string;
}

/**
 * Renders form fields for capturing sales prospect attributes.
 *
 * @param props Form controller, submission state, editions list, and translation delegate.
 * @returns Grid of accessible form field inputs.
 */
export function CreateLeadFormFields({
  control,
  isSubmitting,
  availableEditions,
  t,
}: CreateLeadFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("leads.createDialog.company")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("leads.createDialog.companyPlaceholder")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("leads.createDialog.contact")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("leads.createDialog.contactPlaceholder")}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("leads.createDialog.email")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="cl-phone">{t("leads.createDialog.phone")}</FormLabel>
              <PhoneInput
                id="cl-phone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                error={fieldState.error?.message}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {availableEditions.length > 0 && (
        <FormField
          control={control}
          name="editionKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cl-edition">
                {t("leads.createDialog.editionInterest")}
              </FormLabel>
              <Select
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger id="cl-edition">
                    <SelectValue placeholder={t("leads.createDialog.editionPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t("leads.createDialog.editionNone")}</SelectItem>
                  {availableEditions.map((edition) => (
                    <SelectItem key={edition.key} value={edition.key}>
                      {edition.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("leads.createDialog.message")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("leads.createDialog.messagePlaceholder")}
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("leads.createDialog.notes")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("leads.createDialog.notesPlaceholder")}
                rows={2}
                className="resize-none"
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
