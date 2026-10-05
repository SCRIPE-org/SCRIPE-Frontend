"use client";

import { useState } from "react";
import { Plus, Trash2, Wrench, Ban, Clock } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import type { ResourceBlockKind } from "@modules/venue/availability/src/domain/entities/Availability";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

export function ResourceClosuresTab({ vm }: Props) {
  const { t, language } = useI18n();

  const [modalOpen, setModalOpen] = useState(false);
  const [reasonType, setReasonType] = useState<"Maintenance" | "Unavailable">("Maintenance");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endTime, setEndTime] = useState("12:00");
  const [reason, setReason] = useState("");

  const allClosures = [
    ...vm.maintenanceBlocks.map((b) => ({ ...b, kind: "maintenance" as ResourceBlockKind, label: "Maintenance" })),
    ...vm.blackoutBlocks.map((b) => ({ ...b, kind: "blackout" as ResourceBlockKind, label: "Unavailable" })),
  ].sort((a, b) => Date.parse(b.startUtc) - Date.parse(a.startUtc));

  const handleCreateClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    const kind: ResourceBlockKind = reasonType === "Maintenance" ? "maintenance" : "blackout";
    const startLocal = `${startDate}T${startTime}:00`;
    const endLocal = `${endDate}T${endTime}:00`;

    const ok = await vm.addClosure({
      kind,
      startLocal,
      endLocal,
      reason: reason || (reasonType === "Maintenance" ? "Scheduled Maintenance" : "Unavailable"),
    });

    if (ok) {
      setModalOpen(false);
      setReason("");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>{t("resources.closures.title", { defaultValue: "Closures & Blocked Time" })}</CardTitle>
          <CardDescription className="mt-1">
            {t("resources.closures.description", {
              defaultValue: "Maintenance windows and unavailable periods for this court.",
            })}
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1.5 font-semibold">
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("resources.closures.blockTimeBtn", { defaultValue: "+ Block Time" })}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {allClosures.length === 0 ? (
          <div className="py-8 text-center text-xs text-nx-ink-2 border border-dashed border-nx-line rounded-nx-md">
            <Clock className="size-6 text-nx-ink-3 mx-auto mb-2" aria-hidden="true" />
            <p>{t("resources.closures.empty", { defaultValue: "No closures scheduled. Court is operating according to working hours." })}</p>
          </div>
        ) : (
          <div className="border border-nx-line rounded-nx-md overflow-hidden bg-nx-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-nx-raised border-b border-nx-line text-nx-ink font-semibold">
                <tr>
                  <th className="p-3">{t("resources.closures.table.type", { defaultValue: "Type" })}</th>
                  <th className="p-3">{t("resources.closures.table.period", { defaultValue: "Period" })}</th>
                  <th className="p-3">{t("resources.closures.table.reason", { defaultValue: "Reason" })}</th>
                  <th className="p-3 text-right">{t("resources.closures.table.actions", { defaultValue: "Actions" })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-line/60">
                {allClosures.map((closure) => (
                  <tr key={closure.id} className="hover:bg-nx-surfaceSubtle transition-colors">
                    <td className="p-3 font-medium">
                      {closure.kind === "maintenance" ? (
                        <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 gap-1 font-semibold">
                          <Wrench className="size-3" aria-hidden="true" />
                          <span>{t("resources.closures.types.Maintenance", { defaultValue: "Maintenance" })}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-500/50 bg-slate-500/10 text-slate-700 dark:text-slate-300 gap-1 font-semibold">
                          <Ban className="size-3" aria-hidden="true" />
                          <span>{t("resources.closures.types.Unavailable", { defaultValue: "Unavailable" })}</span>
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-nx-ink-2 tabular-nums">
                      {formatDate(closure.startUtc)} – {formatDate(closure.endUtc)}
                    </td>
                    <td className="p-3 text-nx-ink">{closure.reason}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void vm.deleteClosure(closure.kind, closure)}
                        disabled={vm.saving}
                        className="h-7 px-2 text-nx-ink-3 hover:text-destructive text-xs gap-1"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        <span>{t("resources.closures.table.delete", { defaultValue: "Remove" })}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Block Time Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("resources.blockTimeModal.title", { defaultValue: "Block Time" })}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateClosure} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  {t("resources.blockTimeModal.reasonType", { defaultValue: "Reason Type" })}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReasonType("Maintenance")}
                    className={`p-2.5 rounded-nx-md border text-left text-xs font-semibold transition-all ${
                      reasonType === "Maintenance"
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                        : "border-nx-line hover:bg-nx-surfaceSubtle text-nx-ink-2"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Wrench className="size-3.5" aria-hidden="true" />
                      <span>{t("resources.closures.types.Maintenance", { defaultValue: "Maintenance" })}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReasonType("Unavailable")}
                    className={`p-2.5 rounded-nx-md border text-left text-xs font-semibold transition-all ${
                      reasonType === "Unavailable"
                        ? "border-slate-500 bg-slate-500/10 text-slate-900 dark:text-slate-200 ring-1 ring-slate-500"
                        : "border-nx-line hover:bg-nx-surfaceSubtle text-nx-ink-2"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Ban className="size-3.5" aria-hidden="true" />
                      <span>{t("resources.closures.types.Unavailable", { defaultValue: "Unavailable" })}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="block-reason" className="text-xs">
                  {t("resources.blockTimeModal.reason", { defaultValue: "Reason / Notes" })}
                </Label>
                <Input
                  id="block-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t("resources.blockTimeModal.reasonPlaceholder", {
                    defaultValue: "e.g. Net repair, court resurfacing",
                  })}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={vm.saving} loading={vm.saving}>
                  {t("resources.blockTimeModal.submit", { defaultValue: "Block Time" })}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
