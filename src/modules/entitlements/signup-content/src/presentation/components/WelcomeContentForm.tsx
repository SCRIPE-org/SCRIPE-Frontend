"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import { Globe } from "lucide-react";
import type { WelcomeContent } from "../../domain/entities/SignupContent";
import type { UpdateWelcomeParams } from "../../domain/interfaces/ISignupContentRepository";
import { WelcomeContentFormSchema } from "../schemas/signup-content.schema";

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
 * React presentation component representing the welcome content form UI element.
 */
export function WelcomeContentForm({ welcome, onSave, isSaving }: WelcomeContentFormProps) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(WelcomeContentFormSchema),
    defaultValues: toWelcomeForm(welcome),
  });

  // Sync state when welcome object shifts or is loaded
  useEffect(() => {
    reset(toWelcomeForm(welcome));
  }, [welcome, reset]);

  const onSubmit = (data: FormValues) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Headline */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">
            {t("signupContent.welcome.headlineEn")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              placeholder={t("signupContent.welcome.placeholderEn")}
              {...register("headlineEn")}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.headlineEn && (
              <p className="mt-1 text-xs text-red-400">{errors.headlineEn.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder={t("signupContent.welcome.placeholderAr")}
              dir="rtl"
              {...register("headlineAr")}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.headlineAr && (
              <p className="mt-1 text-xs text-red-400" dir="rtl">
                {errors.headlineAr.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subcopy */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">
            {t("signupContent.welcome.subcopyEn")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Textarea
              placeholder={t("signupContent.welcome.placeholderEn")}
              {...register("subcopyEn")}
              className="min-h-[80px] border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.subcopyEn && (
              <p className="mt-1 text-xs text-red-400">{errors.subcopyEn.message}</p>
            )}
          </div>
          <div>
            <Textarea
              placeholder={t("signupContent.welcome.placeholderAr")}
              dir="rtl"
              {...register("subcopyAr")}
              className="min-h-[80px] border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.subcopyAr && (
              <p className="mt-1 text-xs text-red-400" dir="rtl">
                {errors.subcopyAr.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA Label */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">
            {t("signupContent.welcome.ctaEn")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              placeholder={t("signupContent.welcome.placeholderEn")}
              {...register("ctaLabelEn")}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.ctaLabelEn && (
              <p className="mt-1 text-xs text-red-400">{errors.ctaLabelEn.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder={t("signupContent.welcome.placeholderAr")}
              dir="rtl"
              {...register("ctaLabelAr")}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.ctaLabelAr && (
              <p className="mt-1 text-xs text-red-400" dir="rtl">
                {errors.ctaLabelAr.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trusted By */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">
            {t("signupContent.welcome.trustedByCount")}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Input
              type="number"
              placeholder={t("signupContent.welcome.countPlaceholder")}
              {...register("trustedByCount", { valueAsNumber: true })}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.trustedByCount && (
              <p className="mt-1 text-xs text-red-400">{errors.trustedByCount.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder={t("signupContent.welcome.trustedByLabelEnPlaceholder")}
              {...register("trustedByLabelEn")}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.trustedByLabelEn && (
              <p className="mt-1 text-xs text-red-400">{errors.trustedByLabelEn.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder={t("signupContent.welcome.trustedByLabelArPlaceholder")}
              dir="rtl"
              {...register("trustedByLabelAr")}
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
            />
            {errors.trustedByLabelAr && (
              <p className="mt-1 text-xs text-red-400" dir="rtl">
                {errors.trustedByLabelAr.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {isSaving ? t("signupContent.welcome.saving") : t("signupContent.welcome.save")}
        </Button>
      </div>
    </form>
  );
}
