"use client";

/**
 * Components — one row per part of the interface.
 *
 * Sixteen rows, each a single question ("what shape are my buttons?"), each
 * answered by an option strip. Where a component is cheap to mount, every
 * option chip renders THAT component already wearing its style — a real
 * Button, a real Input, a real Checkbox — via `Preview`, which nests a
 * settings context carrying just that value. Nothing is hand-drawn, so a chip
 * cannot drift from the component it advertises.
 *
 * Where a component is heavy or only exists in context (a whole form, a modal,
 * a month grid, a tree), the chip carries the name and the Stage carries the
 * real thing: point at an option and the persistent preview to the side
 * re-renders as that option, full size, before you commit.
 */

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type {
  AvatarStyle,
  BadgeStyle,
  ButtonStyle,
  CalendarStyle,
  CheckboxStyle,
  DatePickerStyle,
  FormStyle,
  InputStyle,
  LoadingStyle,
  ModalStyle,
  RadioStyle,
  SwitchStyle,
  TableStyle,
  ToastStyle,
  TooltipStyle,
  TreeStyle,
} from "@core/providers/settings-provider";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { DatePicker } from "@core/ui/date-picker";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { Switch } from "@core/ui/switch";
import { Toast, ToastContent, ToastProvider } from "@core/ui/enhanced-toast";
import { Choice, GroupPanel, Preview, Row, type ChoiceOption } from "../controls";
import { ROW } from "../settings-map";

// ── Small helpers ─────────────────────────────────────────────────────────

/**
 * The table sample is deliberately plain markup carrying `data-table-style`:
 * globals.css targets that attribute wherever it appears, so the SAME rules
 * that skin a real GenericTable skin this miniature. The full component is
 * what the Stage renders.
 */
function MiniTable({ style, t }: { style: TableStyle; t: (key: string) => string }) {
  return (
    <span aria-hidden data-table-style={style} className="block w-full">
      <span className="block w-full overflow-hidden rounded-nx-sm border border-nx-line bg-nx-surface">
        <table className="w-full text-[0.625rem]">
          <thead>
            <tr className="border-b border-nx-line-hi bg-nx-hover text-nx-ink-2">
              <th className="px-2 py-1.5 text-start font-semibold">
                {t("settings.sampleTable.name")}
              </th>
              <th className="px-2 py-1.5 text-start font-semibold">
                {t("settings.sampleTable.role")}
              </th>
            </tr>
          </thead>
          <tbody>
            {["john", "jane", "bob"].map((person) => (
              <tr key={person} className="border-b border-nx-line last:border-0">
                <td className="px-2 py-1.5 text-nx-ink">
                  {t(`settings.sampleTable.data.${person}`)}
                </td>
                <td className="px-2 py-1.5 text-nx-ink-3">
                  {t("settings.sampleTable.roles.user")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </span>
    </span>
  );
}

// ── Option catalogues ─────────────────────────────────────────────────────

const BUTTON_STYLES: { value: ButtonStyle; key: string }[] = [
  { value: "default", key: "default" },
  { value: "small-round", key: "smallRound" },
  { value: "medium-round", key: "mediumRound" },
  { value: "large-round", key: "largeRound" },
  { value: "extra-round", key: "extraRound" },
  { value: "super-round", key: "superRound" },
  { value: "rounded", key: "rounded" },
  { value: "sharp", key: "sharp" },
];

const INPUT_STYLES: InputStyle[] = ["default", "rounded", "underlined", "filled"];

// There is no SELECT_STYLES catalogue any more, and no select row: the 26
// invented skins collapsed to a single token surface, so the question this row
// used to ask ("which of eighteen wallpapers should a dropdown wear?") has
// exactly one answer. A control offering one option is not a setting. The
// `selectStyle` FIELD survives so stored blobs keep deserialising — the
// merge-engine migration normalises every retired name onto it.

// The five survivors. The seven retired skins still render — globals.css
// aliases each to its nearest survivor — they just stop being offered.
//
// "compact" is a skin the TableStyle union never gained; the previous picker
// offered it through an `as any` on the setter. Dropping it would remove a
// setting, so it stays, flagged here rather than cast at the call site. It
// also has no strings of its own, so it borrows the spacing option's
// "Compact" and the form style's "Tighter spacing" line — both say exactly
// what the skin does.
const TABLE_STYLES: { value: TableStyle; offUnion?: true }[] = [
  { value: "default" },
  { value: "striped" },
  { value: "bordered" },
  { value: "minimal" },
  { value: "compact" as TableStyle, offUnion: true },
];

const BADGE_STYLES: BadgeStyle[] = [
  "default",
  "modern",
  "glass",
  "neon",
  "gradient",
  "outlined",
  "filled",
  "minimal",
  "pill",
  "square",
];

const AVATAR_STYLES: AvatarStyle[] = ["default", "rounded", "square", "hexagon"];

const FORM_STYLES: FormStyle[] = [
  "default",
  "compact",
  "spacious",
  "inline",
  "modern",
  "glass",
  "minimal",
  "card",
  "neon",
  "elegant",
  "organic",
  "retro",
];

const TOOLTIP_STYLES: TooltipStyle[] = [
  "default",
  "rounded",
  "sharp",
  "bubble",
  "glass",
  "neon",
  "minimal",
  "elegant",
];

const MODAL_STYLES: ModalStyle[] = [
  "default",
  "centered",
  "fullscreen",
  "drawer",
  "glass",
  "floating",
  "card",
  "overlay",
];

// Wave C survivors — the components resolve every stored legacy value onto
// these, so nothing that was ever saved stops rendering.
const TREE_STYLES: TreeStyle[] = ["lines", "cards"];
const DATEPICKER_STYLES: DatePickerStyle[] = ["default", "elegant"];
const CALENDAR_STYLES: CalendarStyle[] = ["default", "elegant"];
const LOADING_STYLES: LoadingStyle[] = ["spinner", "dots", "pulse"];
const CHECKBOX_STYLES: CheckboxStyle[] = ["default", "minimal"];
const RADIO_STYLES: RadioStyle[] = ["default", "minimal"];
const SWITCH_STYLES: SwitchStyle[] = ["default", "ios", "android"];
const TOAST_STYLES: ToastStyle[] = ["classic", "minimal", "modern"];

// ── The group ─────────────────────────────────────────────────────────────

export function ComponentsGroup() {
  const { t } = useI18n();
  const settings = useSettings();

  const buttonOptions = useMemo<ChoiceOption<ButtonStyle>[]>(
    () =>
      BUTTON_STYLES.map(({ value, key }) => ({
        value,
        label: t(`settings.buttonStyle.options.${key}.name`),
        description: t(`settings.buttonStyle.options.${key}.description`),
        sample: (
          <Preview patch={{ buttonStyle: value }} className="w-full">
            <Button size="sm" className="w-full">
              {t("common.save")}
            </Button>
          </Preview>
        ),
      })),
    [t]
  );

  const inputOptions = useMemo<ChoiceOption<InputStyle>[]>(
    () =>
      INPUT_STYLES.map((value) => ({
        value,
        label: t(`settings.inputStyle.options.${value}`),
        sample: (
          <Preview patch={{ inputStyle: value }} className="w-full">
            <Input placeholder={t("settings.preview.input.placeholder")} />
          </Preview>
        ),
      })),
    [t]
  );

  const tableOptions = useMemo<ChoiceOption<TableStyle>[]>(
    () =>
      TABLE_STYLES.map(({ value, offUnion }) => ({
        value,
        label: offUnion
          ? t("settings.spacing.options.compact")
          : t(`settings.tableStyle.options.${value}.title`),
        description: offUnion
          ? t("settings.formStyle.options.compact.description")
          : t(`settings.tableStyle.options.${value}.description`),
        sample: <MiniTable style={value} t={t} />,
      })),
    [t]
  );

  const badgeOptions = useMemo<ChoiceOption<BadgeStyle>[]>(
    () =>
      BADGE_STYLES.map((value) => ({
        value,
        label: t(`settings.badgeStyle.options.${value}.name`),
        description: t(`settings.badgeStyle.options.${value}.description`),
        sample: (
          <Preview patch={{ badgeStyle: value }} className="flex flex-wrap gap-1">
            <Badge variant="active">{t("settings.sampleTable.active")}</Badge>
            <Badge variant="inactive">{t("settings.sampleTable.inactive")}</Badge>
          </Preview>
        ),
      })),
    [t]
  );

  const avatarOptions = useMemo<ChoiceOption<AvatarStyle>[]>(
    () =>
      AVATAR_STYLES.map((value) => ({
        value,
        label: t(`settings.avatarStyle.options.${value}`),
        sample: (
          <Preview patch={{ avatarStyle: value }}>
            <Avatar>
              <AvatarFallback>{t("settings.preview.avatars.md")}</AvatarFallback>
            </Avatar>
          </Preview>
        ),
      })),
    [t]
  );

  const formOptions = useMemo<ChoiceOption<FormStyle>[]>(
    () =>
      FORM_STYLES.map((value) => ({
        value,
        label: t(`settings.formStyle.options.${value}.name`),
        description: t(`settings.formStyle.options.${value}.description`),
      })),
    [t]
  );

  const tooltipOptions = useMemo<ChoiceOption<TooltipStyle>[]>(
    () =>
      TOOLTIP_STYLES.map((value) => ({
        value,
        label: t(`settings.tooltipStyle.options.${value}.name`),
        description: t(`settings.tooltipStyle.options.${value}.description`),
      })),
    [t]
  );

  const modalOptions = useMemo<ChoiceOption<ModalStyle>[]>(
    () =>
      MODAL_STYLES.map((value) => ({
        value,
        label: t(`settings.modalStyle.options.${value}.name`),
        description: t(`settings.modalStyle.options.${value}.description`),
      })),
    [t]
  );

  const treeOptions = useMemo<ChoiceOption<TreeStyle>[]>(
    () =>
      TREE_STYLES.map((value) => ({
        value,
        label: t(`settings.treeStyle.options.${value}.name`),
        description: t(`settings.treeStyle.options.${value}.description`),
      })),
    [t]
  );

  const datePickerOptions = useMemo<ChoiceOption<DatePickerStyle>[]>(
    () =>
      DATEPICKER_STYLES.map((value) => ({
        value,
        label: t(`settings.datePickerStyle.options.${value}.name`),
        description: t(`settings.datePickerStyle.options.${value}.description`),
        sample: (
          <Preview patch={{ datePickerStyle: value }} className="w-full">
            <DatePicker value="" onChange={() => {}} placeholder={t("common.selectDate")} />
          </Preview>
        ),
      })),
    [t]
  );

  const calendarOptions = useMemo<ChoiceOption<CalendarStyle>[]>(
    () =>
      CALENDAR_STYLES.map((value) => ({
        value,
        label: t(`settings.calendarStyle.options.${value}.name`),
        description: t(`settings.calendarStyle.options.${value}.description`),
      })),
    [t]
  );

  const loadingOptions = useMemo<ChoiceOption<LoadingStyle>[]>(
    () =>
      LOADING_STYLES.map((value) => ({
        value,
        label: t(`settings.loadingStyle.options.${value}.name`),
        description: t(`settings.loadingStyle.options.${value}.description`),
        sample: (
          <Preview patch={{ loadingStyle: value }} className="flex w-full justify-center">
            <LoadingSpinner size="sm" showText={false} />
          </Preview>
        ),
      })),
    [t]
  );

  const checkboxOptions = useMemo<ChoiceOption<CheckboxStyle>[]>(
    () =>
      CHECKBOX_STYLES.map((value) => ({
        value,
        label: t(`settings.inputs.checkbox.designOptions.${value}.name`),
        description: t(`settings.inputs.checkbox.designOptions.${value}.description`),
        sample: (
          <Preview patch={{ checkboxStyle: value }} className="flex items-center gap-2">
            <Checkbox design={value} defaultChecked />
            <Checkbox design={value} />
          </Preview>
        ),
      })),
    [t]
  );

  const radioOptions = useMemo<ChoiceOption<RadioStyle>[]>(
    () =>
      RADIO_STYLES.map((value) => ({
        value,
        label: t(`settings.inputs.radio.designOptions.${value}.name`),
        description: t(`settings.inputs.radio.designOptions.${value}.description`),
        sample: (
          <Preview patch={{ radioStyle: value }}>
            <RadioGroup value="on" className="flex items-center gap-2">
              <RadioGroupItem design={value} value="on" />
              <RadioGroupItem design={value} value="off" />
            </RadioGroup>
          </Preview>
        ),
      })),
    [t]
  );

  const switchOptions = useMemo<ChoiceOption<SwitchStyle>[]>(
    () =>
      SWITCH_STYLES.map((value) => ({
        value,
        label: t(`settings.switchStyle.options.${value}.title`),
        description: t(`settings.switchStyle.options.${value}.description`),
        sample: (
          <Preview patch={{ switchStyle: value }} className="flex items-center gap-2">
            {/* readOnly: these are style previews for the setting picker, not
                live controls. They were controlled switches with no handler,
                so clicking one did nothing while still looking interactive. */}
            <Switch checked switchStyle={value} readOnly />
            <Switch checked={false} switchStyle={value} readOnly />
          </Preview>
        ),
      })),
    [t]
  );

  const toastOptions = useMemo<ChoiceOption<ToastStyle>[]>(
    () =>
      TOAST_STYLES.map((value) => ({
        value,
        label: t(`toast.designOptions.${value}.name`),
        description: t(`toast.designOptions.${value}.description`),
        sample: (
          <Preview patch={{ toastStyle: value }} className="w-full">
            <ToastProvider>
              <Toast variant="success" design={value} className="text-[0.625rem]">
                <ToastContent
                  variant="success"
                  title={t("toast.preview.successTitle")}
                  description={t("toast.preview.successDesc")}
                  showIcon
                />
              </Toast>
            </ToastProvider>
          </Preview>
        ),
      })),
    [t]
  );

  return (
    <GroupPanel title={t("settings.tabs.components")}>
      <Row row={ROW["button-style"]}>
        <Choice
          row={ROW["button-style"]}
          value={settings.buttonStyle}
          onSelect={(value) => settings.setButtonStyle(value)}
          options={buttonOptions}
          settingKey="buttonStyle"
        />
      </Row>

      <Row row={ROW["input-style"]}>
        <Choice
          row={ROW["input-style"]}
          value={settings.inputStyle}
          onSelect={(value) => settings.setInputStyle(value)}
          options={inputOptions}
          settingKey="inputStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["table-style"]}>
        <Choice
          row={ROW["table-style"]}
          value={settings.tableStyle}
          onSelect={(value) => settings.setTableStyle(value)}
          options={tableOptions}
          settingKey="tableStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-3"
        />
      </Row>

      <Row row={ROW["badge-style"]}>
        <Choice
          row={ROW["badge-style"]}
          value={settings.badgeStyle}
          onSelect={(value) => settings.setBadgeStyle(value)}
          options={badgeOptions}
          settingKey="badgeStyle"
        />
      </Row>

      <Row row={ROW["avatar-style"]}>
        <Choice
          row={ROW["avatar-style"]}
          value={settings.avatarStyle}
          onSelect={(value) => settings.setAvatarStyle(value)}
          options={avatarOptions}
          settingKey="avatarStyle"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["form-style"]}>
        <Choice
          row={ROW["form-style"]}
          value={settings.formStyle}
          onSelect={(value) => settings.setFormStyle(value)}
          options={formOptions}
          settingKey="formStyle"
          density="chip"
        />
      </Row>

      <Row row={ROW["tooltip-style"]}>
        <Choice
          row={ROW["tooltip-style"]}
          value={settings.tooltipStyle}
          onSelect={(value) => settings.setTooltipStyle(value)}
          options={tooltipOptions}
          settingKey="tooltipStyle"
          density="chip"
        />
      </Row>

      <Row row={ROW["modal-style"]}>
        <Choice
          row={ROW["modal-style"]}
          value={settings.modalStyle}
          onSelect={(value) => settings.setModalStyle(value)}
          options={modalOptions}
          settingKey="modalStyle"
          density="chip"
        />
      </Row>

      <Row row={ROW["tree-style"]}>
        <Choice
          row={ROW["tree-style"]}
          value={settings.treeStyle}
          onSelect={(value) => settings.setTreeStyle(value)}
          options={treeOptions}
          settingKey="treeStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-2"
        />
      </Row>

      <Row row={ROW["datepicker-style"]}>
        <Choice
          row={ROW["datepicker-style"]}
          value={settings.datePickerStyle}
          onSelect={(value) => settings.setDatePickerStyle(value)}
          options={datePickerOptions}
          settingKey="datePickerStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-2"
        />
      </Row>

      <Row row={ROW["calendar-style"]}>
        <Choice
          row={ROW["calendar-style"]}
          value={settings.calendarStyle}
          onSelect={(value) => settings.setCalendarStyle(value)}
          options={calendarOptions}
          settingKey="calendarStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-2"
        />
      </Row>

      <Row row={ROW["loading-style"]}>
        <Choice
          row={ROW["loading-style"]}
          value={settings.loadingStyle}
          onSelect={(value) => settings.setLoadingStyle(value)}
          options={loadingOptions}
          settingKey="loadingStyle"
          gridClassName="sm:grid-cols-3 lg:grid-cols-3"
        />
      </Row>

      <Row row={ROW["checkbox-style"]}>
        <Choice
          row={ROW["checkbox-style"]}
          value={settings.checkboxStyle}
          onSelect={(value) => settings.setCheckboxStyle(value)}
          options={checkboxOptions}
          settingKey="checkboxStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-2"
        />
      </Row>

      <Row row={ROW["radio-style"]}>
        <Choice
          row={ROW["radio-style"]}
          value={settings.radioStyle}
          onSelect={(value) => settings.setRadioStyle(value)}
          options={radioOptions}
          settingKey="radioStyle"
          gridClassName="sm:grid-cols-2 lg:grid-cols-2"
        />
      </Row>

      <Row row={ROW["switch-style"]}>
        <Choice
          row={ROW["switch-style"]}
          value={settings.switchStyle}
          onSelect={(value) => settings.setSwitchStyle(value)}
          options={switchOptions}
          settingKey="switchStyle"
          gridClassName="sm:grid-cols-3 lg:grid-cols-3"
        />
      </Row>

      <Row row={ROW["toast-style"]}>
        <Choice
          row={ROW["toast-style"]}
          value={settings.toastStyle}
          onSelect={(value) => settings.setToastStyle(value)}
          options={toastOptions}
          settingKey="toastStyle"
          gridClassName="sm:grid-cols-3 lg:grid-cols-3"
        />
      </Row>
    </GroupPanel>
  );
}
