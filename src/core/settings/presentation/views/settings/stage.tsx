"use client";

/**
 * The Stage — the persistent live preview, and the centre of this page.
 *
 * It answers the only question a settings page really gets asked: *what will
 * this look like?* Three rules keep the answer honest.
 *
 *  1. It is always there. The Stage is sticky and never unmounts while you
 *     browse a group, so you are never choosing blind.
 *  2. It shows the REAL component. A table for table style, a form for form
 *     style, the actual Logo for logo settings — rendered from the same
 *     `@core/ui` / `@core/crud` primitives the product ships, at real size.
 *  3. It shows the option you are pointing at, before you commit to it.
 *     Hovering or focusing an option peeks it; the Stage renders under a
 *     nested SettingsContext carrying that uncommitted value, so the sample
 *     changes the instant you point at it and snaps back when you leave.
 *     Clicking commits, and then the whole application matches the Stage.
 *
 * The heavier interactive canaries live here too — the sectioned GenericForm,
 * the GenericModal size ladder, the server-search and tree selects — because
 * the Stage is where a real, working instance of each belongs.
 */

import { useState } from "react";
import { Bell, ChevronRight, Eye, PanelLeft } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  SettingsContext,
  useSettings,
  type BorderRadius,
  type SettingsContextType,
} from "@core/settings";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { CustomCalendar } from "@core/ui/custom-calendar";
import { DatePicker } from "@core/ui/date-picker";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { Switch } from "@core/ui/switch";
import { Toast, ToastContent, ToastProvider } from "@core/ui/enhanced-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { TreeView } from "@core/ui/tree-view";
import { Logo } from "@core/ui/logo";
import { GenericTable } from "@core/crud/components/generic-table";
import GenericSelect from "@core/crud/components/generic-select";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { CHART_TOKEN_PALETTE } from "@core/ui/chart";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { StageCaption } from "./controls";
import { useStage } from "./stage-context";
import type { StageSubject } from "./settings-map";

type T = (key: string, vars?: Record<string, string>) => string;

// Peeking a radius has to reach past the props layer: the value lands on
// `--radius` at :root, which only the DOM applicator writes. Mirroring the
// five steps here lets the Stage cascade the peeked value onto its own subtree
// (Tailwind's rounded-lg/md/sm all read --radius) without touching the
// document. Committing still goes through the applicator as usual.
const RADIUS_PEEK: Record<BorderRadius, string> = {
  none: "0",
  small: "0.3rem",
  default: "0.75rem",
  large: "1rem",
  full: "9999px",
};

// ── Individual surfaces ───────────────────────────────────────────────────

function ButtonsSurface({ t }: { t: T }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">{t("settings.preview.buttons.primary")}</Button>
        <Button size="sm" variant="secondary">
          {t("settings.preview.buttons.secondary")}
        </Button>
        <Button size="sm" variant="outline">
          {t("settings.preview.buttons.outline")}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>{t("settings.preview.buttons.default")}</Button>
        <Button variant="ghost">{t("common.cancel")}</Button>
        <Button variant="destructive" size="sm">
          {t("common.delete")}
        </Button>
      </div>
    </div>
  );
}

function InputSurface({ t }: { t: T }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm">{t("settings.preview.input.label")}</Label>
        <Input placeholder={t("settings.preview.input.placeholder")} />
      </div>
      <Input placeholder={t("common.search")} />
    </div>
  );
}

function SelectSurface({ t }: { t: T }) {
  const [single, setSingle] = useState("");
  const [multi, setMulti] = useState<string[]>([]);
  const options = [
    { value: "option1", label: t("settings.selectStyle.option1") },
    { value: "option2", label: t("settings.selectStyle.option2") },
    { value: "option3", label: t("settings.selectStyle.option3") },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <StageCaption>{t("components.unifiedSelect.types.single")}</StageCaption>
        <GenericSelect
          type="single"
          value={single}
          onValueChange={(value: string | string[]) => setSingle(value as string)}
          options={options}
          placeholder={t("settings.selectStyle.selectPlaceholder")}
          className="w-full"
        />
      </div>
      <div className="space-y-1.5">
        <StageCaption>{t("components.unifiedSelect.types.multi")}</StageCaption>
        <GenericSelect
          type="multi"
          value={multi}
          onValueChange={(value: string | string[]) =>
            setMulti(Array.isArray(value) ? value : [value])
          }
          options={options}
          placeholder={t("settings.selectStyle.selectPlaceholder")}
          searchPlaceholder={t("settings.selectStyle.searchPlaceholder")}
          maxSelectedDisplay={2}
        />
      </div>
      {/* Server-search canary — the async option loader stays exercised. */}
      <div className="space-y-1.5">
        <StageCaption>{t("components.multiSelect.serverSearchDemo")}</StageCaption>
        <GenericSelect
          type="multi"
          searchType="server"
          options={[]}
          value={[]}
          onValueChange={() => {}}
          onServerSearch={async (query: string) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return [1, 2, 3].map((n) => ({
              value: `${query}-${n}`,
              label: `${query} ${t("components.multiSelect.serverSearchResult")} ${n}`,
            }));
          }}
          placeholder={t("components.multiSelect.serverSearchPlaceholder")}
          searchPlaceholder={t("components.multiSelect.serverSearchSearchPlaceholder")}
          searchingText={t("components.multiSelect.serverSearchSearchingText")}
          noResultsText={t("components.multiSelect.serverSearchNoResultsText")}
        />
      </div>
      {/* Tree-select canary — the nested option contract stays exercised. */}
      <div className="space-y-1.5">
        <StageCaption>{t("components.treeSelect.title")}</StageCaption>
        <GenericSelect
          type="tree"
          treeData={SAMPLE_TREE}
          placeholder={t("components.treeSelect.placeholder")}
          searchPlaceholder={t("components.treeSelect.searchPlaceholder")}
        />
      </div>
    </div>
  );
}

function TableSurface({ t }: { t: T }) {
  const data = [
    {
      id: 1,
      name: t("settings.sampleTable.data.john"),
      email: t("settings.sampleTable.emails.john"),
      status: "active",
    },
    {
      id: 2,
      name: t("settings.sampleTable.data.jane"),
      email: t("settings.sampleTable.emails.jane"),
      status: "pending",
    },
    {
      id: 3,
      name: t("settings.sampleTable.data.bob"),
      email: t("settings.sampleTable.emails.bob"),
      status: "inactive",
    },
  ];
  const columns = [
    { key: "name" as const, label: t("settings.sampleTable.name"), sortable: true },
    { key: "email" as const, label: t("settings.sampleTable.email") },
    {
      key: "status" as const,
      label: t("settings.sampleTable.status"),
      render: (value: string) => (
        <Badge
          variant={value === "active" ? "active" : value === "pending" ? "pending" : "inactive"}
        >
          {t(`settings.sampleTable.${value}`)}
        </Badge>
      ),
    },
  ];
  return <GenericTable data={data} columns={columns} loading={false} />;
}

function BadgeSurface({ t }: { t: T }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="active">{t("settings.sampleTable.active")}</Badge>
      <Badge variant="inactive">{t("settings.sampleTable.inactive")}</Badge>
      <Badge variant="pending">{t("settings.sampleTable.pending")}</Badge>
      <Badge variant="error">{t("settings.preview.badges.error")}</Badge>
    </div>
  );
}

function AvatarSurface({ t }: { t: T }) {
  return (
    <div className="flex items-center gap-3">
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

/**
 * The GenericForm canary: consecutive fields sharing a `section` must render as
 * one titled, hairline-ruled group, and any `colSpan` inside a group switches
 * it to the two-column grid. Rendering the real component here means form style
 * AND spacing density are previewed by the thing they actually control.
 */
const CANARY_FIELDS: FieldConfig[] = [
  {
    name: "firstName",
    label: "Name",
    type: "text",
    placeholder: "John",
    section: "Profile",
    colSpan: 1,
  },
  {
    name: "lastName",
    label: "Last name",
    type: "text",
    placeholder: "Doe",
    section: "Profile",
    colSpan: 1,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "john@example.com",
    section: "Profile",
    colSpan: 2,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    section: "Details",
    colSpan: 1,
    options: [
      { value: "admin", label: "Admin" },
      { value: "member", label: "Member" },
    ],
  },
  { name: "active", label: "Active", type: "switch", section: "Details", colSpan: 1 },
  { name: "notes", label: "Notes", type: "textarea", rows: 3, section: "Details", colSpan: 2 },
];

function FormSurface() {
  return <GenericForm fields={CANARY_FIELDS} onSubmit={async () => {}} onCancel={() => {}} />;
}

function TooltipSurface({ t }: { t: T }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            {t("settings.preview.tooltip.trigger")}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t("settings.preview.tooltip.content")}</TooltipContent>
      </Tooltip>
      <p className="text-xs text-nx-ink-3">{t("settings.preview.tooltip.label")}</p>
    </div>
  );
}

/**
 * Modal preview + the size-override canary: `size` undefined keeps the
 * modalStyle footprint, an explicit sm/lg must out-rank it.
 */
function ModalSurface({ t }: { t: T }) {
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<"sm" | "lg" | undefined>(undefined);
  // Every ModalStyle member ships a name key, so the localised label is safe.
  const styleName = t(`settings.modalStyle.options.${settings.modalStyle}.name`);

  return (
    <div className="space-y-3">
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="w-full">
        {t("settings.modalStyle.testButton", { style: styleName })}
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={size === undefined ? "default" : "outline"}
          onClick={() => setSize(undefined)}
        >
          {t("settings.modalStyle.options.default.name")}
        </Button>
        <Button
          size="sm"
          variant={size === "sm" ? "default" : "outline"}
          onClick={() => setSize("sm")}
        >
          sm
        </Button>
        <Button
          size="sm"
          variant={size === "lg" ? "default" : "outline"}
          onClick={() => setSize("lg")}
        >
          lg
        </Button>
      </div>
      <p className="text-xs text-nx-ink-3">{t("settings.modalStyle.testInstructions")}</p>
      <GenericModal
        open={open}
        onOpenChange={setOpen}
        title={t("settings.modalStyle.previewTitle", { style: styleName })}
        size={size}
      >
        <div className="space-y-4">
          <p className="text-sm text-nx-ink-2">
            {t("settings.modalStyle.previewDescription", { style: styleName })}
          </p>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-4">
            <h4 className="mb-1 text-sm font-medium text-nx-ink">
              {t("settings.modalStyle.sampleContentTitle")}
            </h4>
            <p className="text-sm text-nx-ink-3">
              {t("settings.modalStyle.sampleContentDescription", { style: styleName })}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(false)}>
            {t("settings.modalStyle.closePreview")}
          </Button>
        </div>
      </GenericModal>
    </div>
  );
}

interface SampleNode {
  value: string;
  label: string;
  children?: SampleNode[];
}

const SAMPLE_TREE: SampleNode[] = [
  {
    value: "warehouse-1",
    label: "Main Warehouse",
    children: [
      {
        value: "section-a",
        label: "Section A",
        children: [
          { value: "shelf-1", label: "Shelf 1" },
          { value: "shelf-2", label: "Shelf 2" },
        ],
      },
      {
        value: "section-b",
        label: "Section B",
        children: [{ value: "shelf-3", label: "Shelf 3" }],
      },
    ],
  },
  {
    value: "warehouse-2",
    label: "Secondary Warehouse",
    children: [{ value: "area-1", label: "Storage Area 1" }],
  },
];

function TreeSurface() {
  return (
    <TreeView<SampleNode>
      data={SAMPLE_TREE}
      getId={(node) => node.value}
      getLabel={(node) => node.label}
      getChildren={(node) => node.children}
      defaultExpanded
    />
  );
}

function DatePickerSurface({ t }: { t: T }) {
  const [value, setValue] = useState("");
  return <DatePicker value={value} onChange={setValue} placeholder={t("common.selectDate")} />;
}

function CalendarSurface() {
  const [value, setValue] = useState("");
  return (
    <div className="overflow-x-auto">
      <CustomCalendar value={value} onChange={setValue} />
    </div>
  );
}

function LoadingSurface() {
  return (
    <div className="flex justify-center py-6">
      <LoadingSpinner showText={false} />
    </div>
  );
}

function CheckboxSurface({ t }: { t: T }) {
  const settings = useSettings();
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Checkbox design={settings.checkboxStyle} id="stage-checkbox-1" defaultChecked />
        <Label htmlFor="stage-checkbox-1" className="text-sm">
          {t("settings.selectStyle.option1")}
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox design={settings.checkboxStyle} id="stage-checkbox-2" />
        <Label htmlFor="stage-checkbox-2" className="text-sm">
          {t("settings.selectStyle.option2")}
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox design={settings.checkboxStyle} id="stage-checkbox-3" disabled />
        <Label htmlFor="stage-checkbox-3" className="text-sm">
          {t("settings.selectStyle.option3")}
        </Label>
      </div>
    </div>
  );
}

function RadioSurface({ t }: { t: T }) {
  const settings = useSettings();
  const [value, setValue] = useState("option1");
  return (
    <RadioGroup value={value} onValueChange={setValue} className="space-y-2.5">
      {["option1", "option2", "option3"].map((option, index) => (
        <div key={option} className="flex items-center gap-2">
          <RadioGroupItem
            design={settings.radioStyle}
            value={option}
            id={`stage-radio-${option}`}
          />
          <Label htmlFor={`stage-radio-${option}`} className="text-sm">
            {t(`settings.selectStyle.option${index + 1}`)}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function SwitchSurface({ t }: { t: T }) {
  const settings = useSettings();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* readOnly — the stage is a live style preview, not a control. */}
        <Switch checked switchStyle={settings.switchStyle} readOnly />
        <span className="text-sm text-nx-ink-2">{t("settings.switchStyle.labels.on")}</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={false} switchStyle={settings.switchStyle} readOnly />
        <span className="text-sm text-nx-ink-2">{t("settings.switchStyle.labels.off")}</span>
      </div>
    </div>
  );
}

function ToastSurface({ t }: { t: T }) {
  const settings = useSettings();
  const { success, error, warning, info } = useEnhancedToast();

  return (
    <div className="space-y-3">
      <div inert className="pointer-events-none space-y-2">
        <ToastProvider>
          <Toast variant="success" design={settings.toastStyle} className="text-xs">
            <ToastContent
              variant="success"
              title={t("toast.preview.successTitle")}
              description={t("toast.preview.successDesc")}
              showIcon
            />
          </Toast>
        </ToastProvider>
        <ToastProvider>
          <Toast variant="destructive" design={settings.toastStyle} className="text-xs">
            <ToastContent
              variant="destructive"
              title={t("toast.preview.errorTitle")}
              description={t("toast.preview.errorDesc")}
              showIcon
            />
          </Toast>
        </ToastProvider>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          onClick={() =>
            success({
              title: t("toast.testMessages.success.title"),
              description: t("toast.testMessages.success.desc"),
              design: settings.toastStyle,
            })
          }
        >
          {t("toast.testButtons.success")}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() =>
            error({
              title: t("toast.testMessages.error.title"),
              description: t("toast.testMessages.error.desc"),
              design: settings.toastStyle,
            })
          }
        >
          {t("toast.testButtons.error")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            warning({
              title: t("toast.testMessages.warning.title"),
              description: t("toast.testMessages.warning.desc"),
              design: settings.toastStyle,
            })
          }
        >
          {t("toast.testButtons.warning")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            info({
              title: t("toast.testMessages.info.title"),
              description: t("toast.testMessages.info.desc"),
              design: settings.toastStyle,
            })
          }
        >
          {t("toast.testButtons.info")}
        </Button>
      </div>
      <p className="text-xs text-nx-ink-3">{t("toast.testHint")}</p>
    </div>
  );
}

function TypographySurface({ t }: { t: T }) {
  return (
    <div className="space-y-2">
      <h4 className="text-lg font-semibold text-nx-ink">
        {t("settings.preview.typography.heading")}
      </h4>
      <p className="text-sm leading-relaxed text-nx-ink-2">
        {t("settings.preview.typography.paragraph")}
      </p>
      <p className="text-sm tabular-nums text-nx-ink-3">1,234.56 · 98,765 · 0.042</p>
    </div>
  );
}

/** The real Logo, shown the way it actually appears: inside a header bar. */
function LogoSurface({ t }: { t: T }) {
  return (
    <div className="space-y-3">
      <div className="flex h-14 items-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised px-4">
        <Logo showText />
      </div>
      <p className="text-xs text-nx-ink-3">{t("settings.logo.previewHelp")}</p>
    </div>
  );
}

/**
 * The chrome mock — the one surface the behaviour switches actually govern.
 * Every element below is gated on the live setting, so flipping a switch (or
 * merely pointing at one) adds or removes the thing it names.
 */
function ChromeSurface({ t }: { t: T }) {
  const settings = useSettings();
  return (
    <div
      className={cn(
        "overflow-hidden rounded-nx-md border border-nx-line bg-nx-ground",
        settings.highContrast && "border-nx-line-hi"
      )}
    >
      <div className="flex h-11 items-center gap-2 border-b border-nx-line bg-nx-surface px-3">
        {settings.showLogo && <Logo showText={false} />}
        {settings.showBreadcrumbs && (
          <nav className="flex min-w-0 items-center gap-1 text-xs text-nx-ink-3">
            <span className="truncate">{t("common.dashboard")}</span>
            <ChevronRight aria-hidden className="h-3 w-3 shrink-0 rtl:rotate-180" />
            <span className="truncate text-nx-ink-2">{t("settings.pageTitle")}</span>
          </nav>
        )}
        <div className="ms-auto flex items-center gap-2">
          {settings.showNotifications && <Bell aria-hidden className="h-4 w-4 text-nx-ink-3" />}
          {settings.showUserAvatar && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[0.625rem]">
                {t("settings.preview.avatars.sm")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
      <div className="flex min-h-24">
        <div className="flex w-12 flex-col items-center gap-2 border-e border-nx-line bg-nx-surface py-3">
          {settings.collapsibleSidebar && (
            <PanelLeft aria-hidden className="h-4 w-4 text-nx-ink-3 rtl:rotate-180" />
          )}
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-nx-accent" />
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-nx-line-hi" />
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-nx-line-hi" />
        </div>
        <div className="flex-1 space-y-2 p-3">
          <span aria-hidden className="block h-2 w-2/3 rounded-full bg-nx-line-hi" />
          <span aria-hidden className="block h-2 w-1/2 rounded-full bg-nx-line" />
          <span aria-hidden className="block h-2 w-3/5 rounded-full bg-nx-line" />
        </div>
      </div>
      {settings.showFooter && (
        <div className="border-t border-nx-line bg-nx-surface px-3 py-2 text-[0.6875rem] text-nx-ink-3">
          {t("common.dashboard")}
        </div>
      )}
    </div>
  );
}

/** Cards are what card style, shadow and hover effects land on. */
function CardSurface({ t }: { t: T }) {
  return (
    <Card className="cursor-pointer">
      <CardHeader>
        <CardTitle className="text-base">{t("settings.preview.card.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-nx-ink-3">{t("settings.preview.card.content")}</p>
        <div className="flex gap-2">
          <Button size="sm">{t("common.save")}</Button>
          <Button size="sm" variant="outline">
            {t("common.cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** A slice of real chrome — what a theme, a radius or a density changes at once. */
function SurfaceComposite({ t }: { t: T }) {
  return (
    <div className="space-y-5">
      <ButtonsSurface t={t} />
      <BadgeSurface t={t} />
      <InputSurface t={t} />
      <TableSurface t={t} />
    </div>
  );
}

function ChartsSurface() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CHART_TOKEN_PALETTE.map((color, index) => (
          <div key={color} className="flex flex-col items-center gap-1">
            <span
              aria-hidden
              className="block h-8 w-8 rounded-nx-sm ring-1 ring-nx-line"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-[0.625rem] tabular-nums text-nx-ink-3">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-nx-ink-3">
        <code className="font-mono">--chart-1 … --chart-8</code>
      </p>
    </div>
  );
}

// ── Subject router ────────────────────────────────────────────────────────

function StageBody({ subject, t }: { subject: StageSubject; t: T }) {
  switch (subject) {
    case "buttons":
      return <ButtonsSurface t={t} />;
    case "input":
      return <InputSurface t={t} />;
    case "select":
      return <SelectSurface t={t} />;
    case "table":
      return <TableSurface t={t} />;
    case "badge":
      return <BadgeSurface t={t} />;
    case "avatar":
      return <AvatarSurface t={t} />;
    case "form":
      return <FormSurface />;
    case "tooltip":
      return <TooltipSurface t={t} />;
    case "modal":
      return <ModalSurface t={t} />;
    case "tree":
      return <TreeSurface />;
    case "datepicker":
      return <DatePickerSurface t={t} />;
    case "calendar":
      return <CalendarSurface />;
    case "loading":
      return <LoadingSurface />;
    case "checkbox":
      return <CheckboxSurface t={t} />;
    case "radio":
      return <RadioSurface t={t} />;
    case "switch":
      return <SwitchSurface t={t} />;
    case "toast":
      return <ToastSurface t={t} />;
    case "typography":
      return <TypographySurface t={t} />;
    case "logo":
      return <LogoSurface t={t} />;
    case "chrome":
      return <ChromeSurface t={t} />;
    case "card":
      return <CardSurface t={t} />;
    case "charts":
      return <ChartsSurface />;
    case "theme":
    case "surface":
    default:
      return <SurfaceComposite t={t} />;
  }
}

// ── The Stage itself ──────────────────────────────────────────────────────

export function Stage({ className }: { className?: string }) {
  const { t } = useI18n();
  const settings = useSettings();
  const { subject, patch } = useStage();

  const peeking = patch !== null && Object.keys(patch).length > 0;
  const previewSettings = peeking
    ? ({ ...settings, ...patch } as SettingsContextType)
    : (settings as SettingsContextType);

  const peekedRadius = patch?.borderRadius as BorderRadius | undefined;
  const stageStyle = peekedRadius
    ? ({ "--radius": RADIUS_PEEK[peekedRadius] } as React.CSSProperties)
    : undefined;

  return (
    <div
      className={cn("overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface", className)}
    >
      <div className="flex items-center gap-2 border-b border-nx-line px-4 py-3">
        <Eye aria-hidden className="h-4 w-4 text-nx-ink-3" />
        <span className="text-sm font-medium text-nx-ink">{t("settings.preview.title")}</span>
        <span
          className={cn(
            "ms-auto rounded-full px-2 py-0.5 text-[0.6875rem] font-medium",
            "transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            peeking ? "bg-nx-accent-wash text-nx-ink opacity-100" : "opacity-0"
          )}
        >
          {t("common.preview")}
        </span>
      </div>
      {/* Deliberately not a live region: the sample re-renders on every hover,
          and announcing a whole table or form each time would bury the control
          the user is actually operating. The controls themselves carry the
          accessible name and checked state. */}
      <div
        className="max-h-[26rem] overflow-y-auto p-4 xl:max-h-[calc(100vh-11rem)]"
        style={stageStyle}
      >
        <SettingsContext.Provider value={previewSettings}>
          <StageBody subject={subject} t={t} />
        </SettingsContext.Provider>
      </div>
    </div>
  );
}
