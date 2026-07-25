"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
import type { WelcomeContent } from "../../domain/entities/SignupContent";
import type { UpdateWelcomeParams } from "../../domain/interfaces/ISignupContentRepository";
import { createWelcomeContentFormSchema } from "../schemas/signup-content.schema";

interface WelcomeContentFormProps {
  welcome: WelcomeContent | null;
  onSave: (data: UpdateWelcomeParams) => void;
  isSaving: boolean;
}

type FormValues = UpdateWelcomeParams;

const EMPTY: FormValues = {
  headlineEn: "",
  headlineAr: "",
  subcopyEn: "",
  subcopyAr: "",
  ctaLabelEn: "",
  ctaLabelAr: "",
  trustedByCount: 0,
  trustedByLabelEn: "",
  trustedByLabelAr: "",
};

function toWelcomeForm(welcome: WelcomeContent | null): FormValues {
  if (!welcome) return EMPTY;

  return {
    headlineEn: welcome.headlineEn,
    headlineAr: welcome.headlineAr,
    subcopyEn: welcome.subcopyEn,
    subcopyAr: welcome.subcopyAr,
    ctaLabelEn: welcome.ctaLabelEn,
    ctaLabelAr: welcome.ctaLabelAr,
    trustedByCount: welcome.trustedByCount,
    trustedByLabelEn: welcome.trustedByLabelEn,
    trustedByLabelAr: welcome.trustedByLabelAr,
  };
}

/**
 * Presentation UI component rendering the welcome content form.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WelcomeContentForm({ welcome, onSave, isSaving }: WelcomeContentFormProps) {
  const { t } = useI18n();
  const schema = useMemo(() => createWelcomeContentFormSchema(t), [t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toWelcomeForm(welcome),
  });
  const { reset } = form;

  // Sync state when welcome object shifts or is loaded
  useEffect(() => {
    reset(toWelcomeForm(welcome));
  }, [welcome, reset]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Headline */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="headlineEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.headlineEn")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("signupContent.welcome.placeholderEn")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headlineAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.headlineAr")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("signupContent.welcome.placeholderAr")} dir="rtl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subcopy */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="subcopyEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.subcopyEn")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("signupContent.welcome.placeholderEn")}
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subcopyAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.subcopyAr")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("signupContent.welcome.placeholderAr")}
                    dir="rtl"
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* CTA Label */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ctaLabelEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.ctaEn")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("signupContent.welcome.placeholderEn")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaLabelAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.ctaAr")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("signupContent.welcome.placeholderAr")} dir="rtl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Trusted By */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="trustedByCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.trustedByCount")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("signupContent.welcome.countPlaceholder")}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trustedByLabelEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.trustedByLabelEn")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("signupContent.welcome.trustedByLabelEnPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trustedByLabelAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.welcome.trustedByLabelAr")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("signupContent.welcome.trustedByLabelArPlaceholder")}
                    dir="rtl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" loading={isSaving}>
            {isSaving ? t("signupContent.welcome.saving") : t("signupContent.welcome.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
