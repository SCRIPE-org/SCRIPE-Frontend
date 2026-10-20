"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

/**
 * Documentation for module export
 */
export function ResourceGeneralTab({ vm }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(vm.resource?.name ?? "");
  const [capacity, setCapacity] = useState(
    vm.resource?.capacity?.maxConcurrentUsage ?? vm.resource?.unitCount ?? 4
  );
  const [description, setDescription] = useState(
    "Indoor padel court with premium panoramic glass and tournament lighting."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void vm.updateGeneral({ name, capacity });
  };

  const getCleanCategory = () => {
    const raw = vm.profile?.name ?? vm.profile?.resourceKindCode;
    if (!raw) return "Padel Court";
    const lower = raw.toLowerCase();
    if (
      lower.includes("schedulable") ||
      lower.includes("profile") ||
      lower.includes("facility resource")
    ) {
      return "Padel Court";
    }
    return raw;
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Left Column: Court Photo Gallery matching approved reference */}
      <div className="space-y-3 lg:col-span-5">
        {/* Main Large Court Photo */}
        <div className="border-nx-border group relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-2xl border bg-nx-raised p-4 shadow-sm sm:h-72">
          <img
            src="/images/venue/padel-court-indoor.svg"
            alt="Court Preview"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="backdrop-blur-xs rounded-md border border-white/20 bg-black/60 px-2.5 py-1 text-xs font-extrabold uppercase tracking-widest text-white">
              Primary Photo
            </span>
          </div>

          <div className="relative z-10 flex items-center justify-between text-white">
            <span className="text-sm font-bold">Court Preview</span>
            <span className="text-xs opacity-80">Tournament Indoor Padel</span>
          </div>
        </div>

        {/* Thumbnail Row */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="group relative h-16 cursor-pointer overflow-hidden rounded-xl border-2 border-[#C6FF00]">
            <img
              src="/images/venue/padel-court-indoor.svg"
              alt="Padel indoor"
              className="size-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="border-nx-border group relative h-16 cursor-pointer overflow-hidden rounded-xl border">
            <img
              src="/images/venue/padel-court-outdoor.svg"
              alt="Padel outdoor"
              className="size-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="border-nx-border group relative h-16 cursor-pointer overflow-hidden rounded-xl border">
            <img
              src="/images/venue/football-turf-night.svg"
              alt="Football turf"
              className="size-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          {/* + Add Photo button */}
          <Button
            variant="outline"
            type="button"
            className="border-nx-border flex h-16 flex-col items-center justify-center rounded-xl border-2 border-dashed text-nx-ink-2 transition-colors hover:border-[#C6FF00] hover:bg-[#C6FF00]/5"
          >
            <Plus className="size-4" />
            <span className="mt-0.5 text-[10px] font-bold">
              {t("resources.general.addPhoto", { defaultValue: "Add Photo" })}
            </span>
          </Button>
        </div>
      </div>

      {/* Right Column: General Information Form */}
      <Card className="shadow-xs rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-name" className="text-xs font-bold text-slate-900 dark:text-white">
              {t("resources.general.name", { defaultValue: "Name" })}
            </Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("resources.general.namePlaceholder", { defaultValue: "e.g. Padel 1" })}
              required
              className="h-9 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                {t("resources.general.sportType", { defaultValue: "Type" })}
              </Label>
              <Input
                value={getCleanCategory()}
                disabled
                className="h-9 rounded-lg bg-slate-50 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                {t("resources.general.status", { defaultValue: "Status" })}
              </Label>
              <Input
                value={
                  vm.resource?.isPublished && vm.priceConfig?.unitPrice != null
                    ? t("resources.filters.active", { defaultValue: "Active" })
                    : t("resources.filters.setupRequired", { defaultValue: "Setup Required" })
                }
                disabled
                className={`h-9 rounded-lg text-xs font-bold ${
                  vm.resource?.isPublished && vm.priceConfig?.unitPrice != null
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                {t("resources.general.branch", { defaultValue: "Branch" })}
              </Label>
              <Input
                value={
                  vm.facility?.name ??
                  t("resources.general.unknownFacility", { defaultValue: "Facility not set" })
                }
                disabled
                className="h-9 rounded-lg bg-slate-50 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="res-capacity"
                className="text-xs font-bold text-slate-900 dark:text-white"
              >
                {t("resources.general.capacity", { defaultValue: "Player / Participant Capacity" })}
              </Label>
              <Input
                id="res-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                className="h-9 rounded-lg text-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {t("resources.general.capacityHelp", {
                  defaultValue:
                    "Max players on court (e.g. 4 for Padel doubles). Does not affect booking concurrency.",
                })}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">
              {t("resources.general.descriptionField", { defaultValue: "Description" })}
            </Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-nx-lg border border-nx-line bg-nx-surface p-2.5 text-xs text-nx-ink placeholder:text-nx-ink-3 focus:outline-none focus:ring-2 focus:ring-nx-accent"
              placeholder={t("resources.general.descriptionPlaceholder", {
                defaultValue: "Describe this court or space",
              })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-nx-line pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-nx-lg text-xs font-semibold"
            >
              {t("resources.general.cancel", { defaultValue: "Cancel" })}
            </Button>
            {!vm.resource?.isPublished && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={vm.saving}
                onClick={() => void vm.publishCourt()}
                className="rounded-nx-lg border-emerald-500 px-4 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {vm.saving ? "Publishing..." : "Publish Court"}
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={vm.saving}
              loading={vm.saving}
              className="hover:bg-nx-accent/90 text-nx-accent-contrast rounded-nx-lg bg-nx-accent px-4 text-xs font-bold"
            >
              {t("resources.general.save", { defaultValue: "Save Changes" })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
