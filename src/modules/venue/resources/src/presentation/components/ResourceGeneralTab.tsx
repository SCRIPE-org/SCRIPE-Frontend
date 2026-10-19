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
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-sm border border-nx-border bg-nx-raised p-4 flex flex-col justify-between group">
          <img
            src="/images/venue/padel-court-indoor.svg"
            alt="Court Preview"
            className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs border border-white/20">
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
          <div className="h-16 rounded-xl border-2 border-[#C6FF00] overflow-hidden relative cursor-pointer group">
            <img src="/images/venue/padel-court-indoor.svg" alt="Padel indoor" className="size-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <div className="h-16 rounded-xl border border-nx-border overflow-hidden relative cursor-pointer group">
            <img src="/images/venue/padel-court-outdoor.svg" alt="Padel outdoor" className="size-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <div className="h-16 rounded-xl border border-nx-border overflow-hidden relative cursor-pointer group">
            <img src="/images/venue/football-turf-night.svg" alt="Football turf" className="size-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          {/* + Add Photo button */}
          <button
            type="button"
            className="h-16 rounded-xl border-2 border-dashed border-nx-border hover:border-[#C6FF00] hover:bg-[#C6FF00]/5 flex flex-col items-center justify-center text-nx-ink-2 transition-colors"
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
              className="w-full rounded-nx-lg border border-nx-line bg-nx-surface p-2.5 text-xs text-nx-ink placeholder:text-nx-ink-3 focus:outline-none focus:ring-2 focus:ring-nx-accent"
              placeholder="Indoor padel court with premium flooring..."
            />
          </div>

          <div className="pt-3 border-t border-nx-line flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-nx-lg"
            >
              Cancel
            </Button>
            {!vm.resource?.isPublished && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={vm.saving}
                onClick={() => void vm.publishCourt()}
                className="text-xs font-bold border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-nx-lg px-4"
              >
                {vm.saving ? "Publishing..." : "Publish Court"}
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={vm.saving}
              loading={vm.saving}
              className="text-xs font-bold bg-nx-accent hover:bg-nx-accent/90 text-nx-accent-contrast rounded-nx-lg px-4"
            >
              {t("resources.general.save", { defaultValue: "Save Changes" })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
