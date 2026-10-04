"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Pencil, ShieldAlert, Trash2, Wrench } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import type { ResourceBlock, ResourceBlockKind, SaveResourceBlock } from "../../domain/entities/Availability";

interface Props {
  resourceId: string;
  timeZoneId: string;
  blackouts: ResourceBlock[];
  maintenanceBlocks: ResourceBlock[];
  saving: boolean;
  onSave: (kind: ResourceBlockKind, existing: ResourceBlock | null, data: SaveResourceBlock) => Promise<void>;
  onDelete: (kind: ResourceBlockKind, block: ResourceBlock) => Promise<void>;
}

function asLocalInput(value: string, timeZoneId: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZoneId,
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(value));
    const result = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${result.year}-${result.month}-${result.day}T${result.hour}:${result.minute}`;
  } catch {
    return value.slice(0, 16);
  }
}

function newDraft(resourceId: string, timeZoneId: string): SaveResourceBlock {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    resourceId,
    timeZoneId,
    startLocal: asLocalInput(now.toISOString(), timeZoneId),
    endLocal: asLocalInput(inOneHour.toISOString(), timeZoneId),
    hardBlock: true,
    reason: "",
  };
}

export function ResourceBlocksPanel({ resourceId, timeZoneId, blackouts, maintenanceBlocks, saving, onSave, onDelete }: Props) {
  const { t } = useI18n();
  const { success, error } = useEnhancedToast();
  const canViewBlackouts = usePermission(VENUE_PERMISSIONS.BLACKOUT_VIEW);
  const canViewMaintenance = usePermission(VENUE_PERMISSIONS.MAINTENANCE_BLOCK_VIEW);
  const canCreateBlackouts = usePermission(VENUE_PERMISSIONS.BLACKOUT_CREATE);
  const canCreateMaintenance = usePermission(VENUE_PERMISSIONS.MAINTENANCE_BLOCK_CREATE);
  const canUpdateBlackouts = usePermission(VENUE_PERMISSIONS.BLACKOUT_UPDATE);
  const canUpdateMaintenance = usePermission(VENUE_PERMISSIONS.MAINTENANCE_BLOCK_UPDATE);
  const canDeleteBlackouts = usePermission(VENUE_PERMISSIONS.BLACKOUT_DELETE);
  const canDeleteMaintenance = usePermission(VENUE_PERMISSIONS.MAINTENANCE_BLOCK_DELETE);
  const [kind, setKind] = useState<ResourceBlockKind>("blackout");
  const [editing, setEditing] = useState<ResourceBlock | null>(null);
  const [draft, setDraft] = useState<SaveResourceBlock>(() => newDraft(resourceId, timeZoneId));

  useEffect(() => {
    if (!editing) {
      setDraft(newDraft(resourceId, timeZoneId));
    }
  }, [resourceId, timeZoneId, editing]);

  const current = kind === "blackout" ? blackouts : maintenanceBlocks;
  const canWrite = kind === "blackout" ? (editing ? canUpdateBlackouts : canCreateBlackouts) : (editing ? canUpdateMaintenance : canCreateMaintenance);
  const canRead = canViewBlackouts || canViewMaintenance;
  const icon = kind === "blackout" ? Ban : Wrench;
  const KindIcon = icon;
  const blocks = useMemo(() => [
    ...(canViewBlackouts ? blackouts.map((block) => ({ kind: "blackout" as const, block })) : []),
    ...(canViewMaintenance ? maintenanceBlocks.map((block) => ({ kind: "maintenance" as const, block })) : []),
  ].sort((a, b) => a.block.startUtc.localeCompare(b.block.startUtc)), [blackouts, maintenanceBlocks, canViewBlackouts, canViewMaintenance]);

  if (!canRead) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.reason.trim() || !draft.startLocal || !draft.endLocal || draft.endLocal <= draft.startLocal) {
      error({ title: t("availability.blocks.validation") });
      return;
    }
    try {
      await onSave(kind, editing, { ...draft, resourceId, timeZoneId, reason: draft.reason.trim() });
      success({ title: t(editing ? "availability.blocks.updated" : "availability.blocks.created") });
      setEditing(null);
      setDraft(newDraft(resourceId, timeZoneId));
    } catch (caught) {
      error({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

  const beginEdit = (nextKind: ResourceBlockKind, block: ResourceBlock) => {
    setKind(nextKind);
    setEditing(block);
    setDraft({ resourceId, timeZoneId: block.timeZoneId, startLocal: asLocalInput(block.startUtc, block.timeZoneId), endLocal: asLocalInput(block.endUtc, block.timeZoneId), hardBlock: block.hardBlock, reason: block.reason });
  };

  const remove = async (nextKind: ResourceBlockKind, block: ResourceBlock) => {
    try {
      await onDelete(nextKind, block);
      success({ title: t("availability.blocks.deleted") });
      if (editing?.id === block.id) {
        setEditing(null);
        setDraft(newDraft(resourceId, timeZoneId));
      }
    } catch (caught) {
      error({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-4" />{t("availability.blocks.title")}</CardTitle>
        <p className="text-sm text-nx-ink-2">{t("availability.blocks.description")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="warning"><ShieldAlert /><AlertTitle>{t("availability.blocks.precedenceTitle")}</AlertTitle><AlertDescription>{t("availability.blocks.precedenceDescription")}</AlertDescription></Alert>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={kind === "blackout" ? "default" : "outline"} size="sm" onClick={() => { setKind("blackout"); setEditing(null); setDraft(newDraft(resourceId, timeZoneId)); }}><Ban className="size-4" />{t("availability.blocks.blackout")}</Button>
          <Button type="button" variant={kind === "maintenance" ? "default" : "outline"} size="sm" onClick={() => { setKind("maintenance"); setEditing(null); setDraft(newDraft(resourceId, timeZoneId)); }}><Wrench className="size-4" />{t("availability.blocks.maintenance")}</Button>
        </div>
        {canWrite && (
          <form onSubmit={submit} className="grid gap-4 rounded-nx-md border border-nx-line bg-nx-surface p-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center gap-2 text-sm font-semibold"><KindIcon className="size-4" />{t(editing ? "availability.blocks.editTitle" : "availability.blocks.createTitle")}</div>
            <div className="space-y-2"><Label htmlFor="block-start">{t("availability.blocks.start")}</Label><Input id="block-start" type="datetime-local" value={draft.startLocal} onChange={(event) => setDraft({ ...draft, startLocal: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="block-end">{t("availability.blocks.end")}</Label><Input id="block-end" type="datetime-local" value={draft.endLocal} onChange={(event) => setDraft({ ...draft, endLocal: event.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="block-reason">{t("availability.blocks.reason")}</Label><Textarea id="block-reason" maxLength={500} value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} /></div>
            <Label htmlFor="block-hard" className="flex items-center gap-2 text-sm md:col-span-2 cursor-pointer">
              <Checkbox id="block-hard" checked={draft.hardBlock} onCheckedChange={(checked) => setDraft({ ...draft, hardBlock: checked === true })} />
              {t("availability.blocks.hardBlock")}
            </Label>
            <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="outline" onClick={() => { setEditing(null); setDraft(newDraft(resourceId, timeZoneId)); }} disabled={saving}>{t("common.cancel")}</Button><Button type="submit" disabled={saving}>{saving ? t("common.saving") : t(editing ? "common.save" : "availability.blocks.create")}</Button></div>
          </form>
        )}
        <div className="space-y-2">
          {blocks.length === 0 ? <p className="text-sm text-nx-ink-3">{t("availability.blocks.empty")}</p> : blocks.map(({ kind: itemKind, block }) => {
            const editable = itemKind === "blackout" ? canUpdateBlackouts : canUpdateMaintenance;
            const deletable = itemKind === "blackout" ? canDeleteBlackouts : canDeleteMaintenance;
            return <div key={`${itemKind}-${block.id}`} className="flex flex-wrap items-start justify-between gap-3 rounded-nx-md border border-nx-line p-3"><div className="space-y-1"><div className="flex items-center gap-2"><Badge variant={itemKind === "blackout" ? "warning" : "inactive"}>{t(itemKind === "blackout" ? "availability.blocks.blackout" : "availability.blocks.maintenance")}</Badge>{block.hardBlock && <Badge variant="destructive">{t("availability.blocks.hard")}</Badge>}</div><p className="text-sm font-medium">{block.reason}</p><p className="text-xs text-nx-ink-3">{asLocalInput(block.startUtc, block.timeZoneId)} — {asLocalInput(block.endUtc, block.timeZoneId)} · {block.timeZoneId}</p></div><div className="flex gap-1">{editable && <Button type="button" variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => beginEdit(itemKind, block)}><Pencil className="size-4" /></Button>}{deletable && <Button type="button" variant="ghost" size="icon" aria-label={t("common.delete")} onClick={() => void remove(itemKind, block)}><Trash2 className="size-4" /></Button>}</div></div>;
          })}
        </div>
        {current.length > 0 && <p className="text-xs text-nx-ink-3">{t("availability.blocks.count", { count: current.length })}</p>}
      </CardContent>
    </Card>
  );
}
