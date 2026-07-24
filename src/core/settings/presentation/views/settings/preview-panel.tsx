"use client";

/**
 * The live-preview dock.
 *
 * Wave H retired the old disconnected showcase (every primitive stacked in one
 * scroll, some shrunk with a CSS `scale`). The dock now foregrounds the ONE
 * surface the active destination controls, at real 1:1 size, rendered from the
 * genuine primitive — and because every primitive reads the global settings
 * provider, the preview reflects the committed selection the instant it lands.
 *
 * Known gap (needs section-owned wiring, tracked for the section waves):
 * hover-to-preview / click-to-commit at the individual picker-option level
 * requires each `*-section` picker to emit its hovered option to this dock.
 * Those internals belong to other waves, so the dock reflects the *committed*
 * selection; hovering an option previews inside its own card, clicking commits.
 */

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Checkbox } from "@core/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { DatePicker } from "@core/ui/date-picker";
import { CustomCalendar } from "@core/ui/custom-calendar";
import { GenericTable } from "@core/crud/components/generic-table";
import GenericSelect from "@core/crud/components/generic-select";
import { CHART_TOKEN_PALETTE } from "@core/ui/chart";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type { PreviewKind } from "./settings-nav";

type T = (key: string) => string;

/** One captioned block inside the dock. Rows are split by a single hairline. */
function PreviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 py-4 first:pt-0 last:pb-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-nx-ink-3">{label}</p>
      {children}
    </div>
  );
}

function ButtonsPreview({ t }: { t: T }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm">{t("settings.preview.buttons.primary")}</Button>
      <Button size="sm" variant="secondary">
        {t("settings.preview.buttons.secondary")}
      </Button>
      <Button size="sm" variant="outline">
        {t("settings.preview.buttons.outline")}
      </Button>
    </div>
  );
}

function BadgesPreview({ t }: { t: T }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="active">{t("settings.sampleTable.active")}</Badge>
      <Badge variant="inactive">{t("settings.sampleTable.inactive")}</Badge>
      <Badge variant="pending">{t("settings.sampleTable.pending")}</Badge>
      <Badge variant="error">{t("settings.preview.badges.error")}</Badge>
    </div>
  );
}

function InputPreview({ t }: { t: T }) {
  return <Input placeholder={t("settings.preview.input.placeholder")} />;
}

function AvatarsPreview({ t }: { t: T }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{t("settings.preview.avatars.sm")}</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>{t("settings.preview.avatars.md")}</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarFallback>{t("settings.preview.avatars.lg")}</AvatarFallback>
      </Avatar>
    </div>
  );
}

function TablePreview({ t }: { t: T }) {
  const data = [
    { id: 1, name: t("settings.sampleTable.data.john"), email: t("settings.sampleTable.emails.john"), status: "active" },
    { id: 2, name: t("settings.sampleTable.data.jane"), email: t("settings.sampleTable.emails.jane"), status: "inactive" },
    { id: 3, name: t("settings.sampleTable.data.bob"), email: t("settings.sampleTable.emails.bob"), status: "active" },
  ];
  const columns = [
    { key: "name" as const, label: t("settings.sampleTable.name"), sortable: true },
    { key: "email" as const, label: t("settings.sampleTable.email") },
    {
      key: "status" as const,
      label: t("settings.sampleTable.status"),
      render: (value: string) => (
        <Badge variant={value === "active" ? "active" : "inactive"}>
          {t(`settings.sampleTable.${value}`)}
        </Badge>
      ),
    },
  ];
  return <GenericTable data={data} columns={columns} loading={false} />;
}

function SelectPreview({ t }: { t: T }) {
  const [value, setValue] = useState<string>("");
  return (
    <GenericSelect
      type="single"
      value={value}
      onValueChange={(v: string | string[]) => setValue(v as string)}
      options={[
        { value: "option1", label: t("settings.selectStyle.option1") },
        { value: "option2", label: t("settings.selectStyle.option2") },
        { value: "option3", label: t("settings.selectStyle.option3") },
      ]}
      placeholder={t("settings.selectStyle.selectPlaceholder")}
      className="w-full"
    />
  );
}

function FormPreview({ t }: { t: T }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm">{t("settings.preview.input.label")}</Label>
        <Input placeholder={t("settings.preview.input.placeholder")} />
      </div>
      <Button size="sm">{t("common.save")}</Button>
    </div>
  );
}

function TooltipPreview({ t }: { t: T }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          {t("settings.preview.tooltip.trigger")}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("settings.preview.tooltip.content")}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function LoadingPreview() {
  return (
    <div className="flex justify-center py-2">
      <LoadingSpinner showText={false} />
    </div>
  );
}

function DatePickerPreview({ t }: { t: T }) {
  const [value, setValue] = useState("");
  return <DatePicker value={value} onChange={setValue} placeholder={t("common.selectDate")} />;
}

function CalendarPreview() {
  const [value, setValue] = useState("");
  return (
    <div className="overflow-x-auto">
      <CustomCalendar value={value} onChange={setValue} />
    </div>
  );
}

function ChartsPreview() {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CHART_TOKEN_PALETTE.map((color, index) => (
          <div key={color} className="flex flex-col items-center gap-1">
            <div
              className="h-8 w-8 rounded-nx-sm border border-nx-line"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] tabular-nums text-nx-ink-3">{index + 1}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-nx-ink-3">
        <code className="font-mono">--chart-1 … --chart-8</code>
      </p>
    </div>
  );
}

function CheckboxRadioPreview({ t }: { t: T }) {
  const settings = useSettings();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox design={settings.checkboxStyle} id="dock-checkbox" defaultChecked />
        <Label htmlFor="dock-checkbox" className="text-sm">
          {t("settings.inputs.preview")}
        </Label>
      </div>
      <RadioGroup value="one" className="space-y-1.5">
        <div className="flex items-center gap-2">
          <RadioGroupItem design={settings.radioStyle} value="one" id="dock-radio-1" />
          <Label htmlFor="dock-radio-1" className="text-sm">
            {t("settings.selectStyle.option1")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem design={settings.radioStyle} value="two" id="dock-radio-2" />
          <Label htmlFor="dock-radio-2" className="text-sm">
            {t("settings.selectStyle.option2")}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

function TypographyPreview({ t }: { t: T }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-lg font-semibold text-nx-ink">{t("settings.preview.typography.heading")}</h4>
      <p className="text-sm text-nx-ink-2">{t("settings.preview.typography.paragraph")}</p>
      <p className="text-sm tabular-nums text-nx-ink-3">1,234.56 · 98,765 · 0.042</p>
    </div>
  );
}

/** The composed sampler for surface-wide destinations (colours, radius, spacing,
 *  card style, hover, modal, tree) — a real slice of chrome that moves together. */
function SurfacePreview({ t }: { t: T }) {
  return (
    <>
      <PreviewRow label={t("settings.preview.buttons.label")}>
        <ButtonsPreview t={t} />
      </PreviewRow>
      <PreviewRow label={t("settings.preview.badges.label")}>
        <BadgesPreview t={t} />
      </PreviewRow>
      <PreviewRow label={t("settings.preview.input.label")}>
        <InputPreview t={t} />
      </PreviewRow>
      <PreviewRow label={t("settings.preview.table.label")}>
        <TablePreview t={t} />
      </PreviewRow>
    </>
  );
}

function DockBody({ previewKind, t }: { previewKind: PreviewKind; t: T }) {
  switch (previewKind) {
    case "buttons":
      return (
        <PreviewRow label={t("settings.preview.buttons.label")}>
          <ButtonsPreview t={t} />
        </PreviewRow>
      );
    case "input":
      return (
        <PreviewRow label={t("settings.preview.input.label")}>
          <InputPreview t={t} />
        </PreviewRow>
      );
    case "select":
      return (
        <PreviewRow label={t("settings.selectStyle.title")}>
          <SelectPreview t={t} />
        </PreviewRow>
      );
    case "table":
      return (
        <PreviewRow label={t("settings.preview.table.label")}>
          <TablePreview t={t} />
        </PreviewRow>
      );
    case "badge":
      return (
        <PreviewRow label={t("settings.preview.badges.label")}>
          <BadgesPreview t={t} />
        </PreviewRow>
      );
    case "avatar":
      return (
        <PreviewRow label={t("settings.preview.avatars.label")}>
          <AvatarsPreview t={t} />
        </PreviewRow>
      );
    case "form":
      return (
        <PreviewRow label={t("settings.formStyle.title")}>
          <FormPreview t={t} />
        </PreviewRow>
      );
    case "tooltip":
      return (
        <PreviewRow label={t("settings.preview.tooltip.label")}>
          <TooltipPreview t={t} />
        </PreviewRow>
      );
    case "loading":
      return (
        <PreviewRow label={t("settings.preview.loading.label")}>
          <LoadingPreview />
        </PreviewRow>
      );
    case "datepicker":
      return (
        <PreviewRow label={t("settings.datePickerStyle.title")}>
          <DatePickerPreview t={t} />
        </PreviewRow>
      );
    case "calendar":
      return (
        <PreviewRow label={t("settings.calendarStyle.title")}>
          <CalendarPreview />
        </PreviewRow>
      );
    case "charts":
      return (
        <PreviewRow label={t("settings.tabs.charts")}>
          <ChartsPreview />
        </PreviewRow>
      );
    case "checkboxRadio":
      return (
        <PreviewRow label={t("settings.inputs.preview")}>
          <CheckboxRadioPreview t={t} />
        </PreviewRow>
      );
    case "typography":
      return (
        <PreviewRow label={t("settings.preview.typography.label")}>
          <TypographyPreview t={t} />
        </PreviewRow>
      );
    default:
      return <SurfacePreview t={t} />;
  }
}

interface PreviewPanelProps {
  previewKind: PreviewKind;
}

export function PreviewPanel({ previewKind }: PreviewPanelProps) {
  const { t } = useI18n();
  if (previewKind === null) return null;

  return (
    <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
      <div className="flex items-center gap-2 border-b border-nx-line px-4 py-3">
        <Eye className="h-4 w-4 text-nx-ink-3" />
        <span className="text-sm font-medium text-nx-ink">{t("settings.preview.title")}</span>
      </div>
      <div className="divide-y divide-nx-line px-4 py-2">
        <DockBody previewKind={previewKind} t={t} />
      </div>
    </div>
  );
}
