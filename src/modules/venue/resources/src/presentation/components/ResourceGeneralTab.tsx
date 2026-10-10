"use client";

import { useState } from "react";
import { Plus, Camera, Sparkles } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

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
    if (lower.includes("schedulable") || lower.includes("profile") || lower.includes("facility resource")) {
      return "Padel Court";
    }
    return raw;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Court Photo Gallery matching approved reference */}
      <div className="lg:col-span-5 space-y-3">
        {/* Main Large Court Photo */}
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-800 p-4 flex flex-col justify-between">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />
          {/* Subtle sports court line markings */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t border-white/30 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-xs">
              Primary Photo
            </span>
          </div>

          <div className="relative z-10 flex items-center justify-between text-white">
            <span className="text-sm font-bold">Court Preview</span>
            <span className="text-xs opacity-80">Court Photo</span>
          </div>
        </div>

        {/* Thumbnail Row */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="h-16 rounded-xl border-2 border-blue-600 bg-gradient-to-tr from-blue-800 to-indigo-600 overflow-hidden cursor-pointer" />
          <div className="h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-emerald-800 to-teal-600 overflow-hidden cursor-pointer" />
          <div className="h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-purple-800 to-indigo-900 overflow-hidden cursor-pointer" />
          {/* + Add Photo button */}
          <button
            type="button"
            className="h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Plus className="size-4" />
            <span className="text-[10px] font-bold mt-0.5">Add Photo</span>
          </button>
        </div>
      </div>

      {/* Right Column: General Information Form */}
      <Card className="lg:col-span-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-name" className="text-xs font-bold text-slate-900 dark:text-white">
              {t("resources.general.name", { defaultValue: "Name" })}
            </Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Padel 1"
              required
              className="h-9 text-xs rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                {t("resources.general.sportType", { defaultValue: "Type" })}
              </Label>
              <Input
                value={getCleanCategory()}
                disabled
                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">Status</Label>
              <Input
                value={vm.resource?.isPublished && vm.priceConfig?.unitPrice != null ? "Active" : "Setup Required"}
                disabled
                className={`h-9 text-xs rounded-lg font-bold ${
                  vm.resource?.isPublished && vm.priceConfig?.unitPrice != null
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-white">
                {t("resources.general.branch", { defaultValue: "Branch" })}
              </Label>
              <Input
                value={vm.facility?.name ?? "Nasr City Club"}
                disabled
                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="res-capacity" className="text-xs font-bold text-slate-900 dark:text-white">
                {t("resources.general.capacity", { defaultValue: "Player / Participant Capacity" })}
              </Label>
              <Input
                id="res-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                className="h-9 text-xs rounded-lg"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {t("resources.general.capacityHelp", {
                  defaultValue: "Max players on court (e.g. 4 for Padel doubles). Does not affect booking concurrency.",
                })}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-900 dark:text-white">Description</Label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Indoor padel court with premium flooring..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={vm.saving}
              loading={vm.saving}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4"
            >
              {t("resources.general.save", { defaultValue: "Save Changes" })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
