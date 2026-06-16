"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import { Globe } from "lucide-react";
import type { WelcomeContent } from "../../domain/entities/SignupContent";
import type { UpdateWelcomeParams } from "../../domain/interfaces/ISignupContentRepository";

interface WelcomeContentFormProps {
  welcome: WelcomeContent | null;
  onSave: (data: UpdateWelcomeParams) => void;
  isSaving: boolean;
}

const EMPTY: UpdateWelcomeParams = {
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

function toWelcomeForm(welcome: WelcomeContent | null): UpdateWelcomeParams {
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

export function WelcomeContentForm({ welcome, onSave, isSaving }: WelcomeContentFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<UpdateWelcomeParams>(() => toWelcomeForm(welcome));

  const set = (field: keyof UpdateWelcomeParams, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Headline */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">
            {t("signupContent.welcome.headlineEn")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="EN"
            value={form.headlineEn}
            onChange={(e) => set("headlineEn", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
          <Input
            placeholder="AR"
            dir="rtl"
            value={form.headlineAr}
            onChange={(e) => set("headlineAr", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
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
          <Textarea
            placeholder="EN"
            value={form.subcopyEn}
            onChange={(e) => set("subcopyEn", e.target.value)}
            className="min-h-[80px] border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
          <Textarea
            placeholder="AR"
            dir="rtl"
            value={form.subcopyAr}
            onChange={(e) => set("subcopyAr", e.target.value)}
            className="min-h-[80px] border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
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
          <Input
            placeholder="EN"
            value={form.ctaLabelEn}
            onChange={(e) => set("ctaLabelEn", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
          <Input
            placeholder="AR"
            dir="rtl"
            value={form.ctaLabelAr}
            onChange={(e) => set("ctaLabelAr", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
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
          <Input
            type="number"
            placeholder="Count"
            value={form.trustedByCount}
            onChange={(e) => set("trustedByCount", Number(e.target.value))}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
          <Input
            placeholder="Label EN"
            value={form.trustedByLabelEn}
            onChange={(e) => set("trustedByLabelEn", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
          <Input
            placeholder="Label AR"
            dir="rtl"
            value={form.trustedByLabelAr}
            onChange={(e) => set("trustedByLabelAr", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600"
          />
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
