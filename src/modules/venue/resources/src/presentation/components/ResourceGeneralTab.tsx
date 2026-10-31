"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { extractCourtBio } from "../../domain/court-photos";
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
    extractCourtBio(vm.resource?.description)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await vm.uploadCourtPhoto(file);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleCancel = () => {
    setName(vm.resource?.name ?? "");
    setCapacity(vm.resource?.capacity?.maxConcurrentUsage ?? vm.resource?.unitCount ?? 4);
    setDescription(extractCourtBio(vm.resource?.description));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void vm.updateGeneral({ name, capacity, description });
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
        <div className="border-nx-line group relative flex h-64 w-full flex-col justify-between overflow-hidden rounded-2xl border bg-nx-raised p-4 shadow-sm sm:h-72">
          <img
            src={vm.activePhoto}
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
          {vm.courtPhotos.slice(0, 3).map((photo, idx) => (
            <div
              key={idx}
              onClick={() => vm.setActivePhoto(photo)}
              className={`group relative h-16 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                vm.activePhoto === photo ? "border-primary ring-1 ring-primary" : "border-nx-line hover:border-nx-ink-3"
              }`}
            >
              <img
                src={photo}
                alt={`Court photo ${idx + 1}`}
                className="size-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
          ))}
          {/* + Add Photo button with real file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handlePhotoSelect}
            disabled={vm.uploadingPhoto}
          />
          <Button
            variant="outline"
            type="button"
            disabled={vm.uploadingPhoto}
            onClick={() => fileInputRef.current?.click()}
            className="border-nx-line flex h-16 flex-col items-center justify-center rounded-xl border-2 border-dashed text-nx-ink-2 transition-colors hover:border-primary hover:bg-primary/5"
          >
            {vm.uploadingPhoto ? (
              <LoadingSpinner size="sm" showText={false} />
            ) : (
              <>
                <Plus className="size-4" />
                <span className="mt-0.5 text-[10px] font-bold">
                  {t("resources.general.addPhoto", { defaultValue: "Add Photo" })}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column: General Information Form */}
      <Card className="rounded-2xl border border-nx-line bg-nx-surface p-6 lg:col-span-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-name" className="text-xs font-bold text-nx-ink">
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
              <Label className="text-xs font-bold text-nx-ink">
                {t("resources.general.sportType", { defaultValue: "Type" })}
              </Label>
              <Input
                value={getCleanCategory()}
                disabled
                className="h-9 rounded-lg bg-nx-raised text-xs text-nx-ink-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-nx-ink">
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
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-warning/20 bg-warning/10 text-warning"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-nx-ink">
                {t("resources.general.branch", { defaultValue: "Branch" })}
              </Label>
              <Input
                value={
                  vm.facility?.name ??
                  t("resources.general.unknownFacility", { defaultValue: "Facility not set" })
                }
                disabled
                className="h-9 rounded-lg bg-nx-raised text-xs text-nx-ink-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="res-capacity"
                className="text-xs font-bold text-nx-ink"
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
              <p className="text-[10px] text-nx-ink-3">
                {t("resources.general.capacityHelp", {
                  defaultValue:
                    "Max players on court (e.g. 4 for Padel doubles). Does not affect booking concurrency.",
                })}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-nx-ink">
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
              onClick={handleCancel}
              className="rounded-lg text-xs font-semibold"
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
                className="rounded-nx-lg border-success/40 px-4 text-xs font-bold text-success hover:bg-success/10"
              >
                {vm.saving ? "Publishing..." : "Publish Court"}
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={vm.saving}
              loading={vm.saving}
              className="bg-primary text-nx-on-fill rounded-lg px-4 text-xs font-bold hover:bg-primary/90"
            >
              {t("resources.general.save", { defaultValue: "Save Changes" })}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
