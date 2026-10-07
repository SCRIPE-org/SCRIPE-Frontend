"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

export function ResourceGeneralTab({ vm }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(vm.resource?.name ?? "");
  const [capacity, setCapacity] = useState(
    vm.resource?.capacity?.maxConcurrentUsage ?? vm.resource?.unitCount ?? 1
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void vm.updateGeneral({ name, capacity });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("resources.general.title", { defaultValue: "General Information" })}</CardTitle>
        <CardDescription>
          {t("resources.general.description", {
            defaultValue: "Court identity, sport category, capacity, and branch location.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="res-name">
              {t("resources.general.name", { defaultValue: "Court / Field Name" })}
            </Label>
            <Input
              id="res-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("resources.general.namePlaceholder", {
                defaultValue: "e.g. Padel Court 1",
              })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("resources.general.sportType", { defaultValue: "Sport / Resource Type" })}</Label>
              <Input
                value={vm.profile?.name ?? vm.profile?.resourceKindCode ?? "Court"}
                disabled
                className="bg-nx-surfaceSubtle text-nx-ink-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="res-capacity">
                {t("resources.general.capacity", { defaultValue: "Capacity (Players / Units)" })}
              </Label>
              <Input
                id="res-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("resources.general.branch", { defaultValue: "Branch / Facility" })}</Label>
            <Input
              value={vm.facility?.name ?? "Main Branch"}
              disabled
              className="bg-nx-surfaceSubtle text-nx-ink-2"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={vm.saving} loading={vm.saving}>
              {t("resources.general.save", { defaultValue: "Save Changes" })}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
