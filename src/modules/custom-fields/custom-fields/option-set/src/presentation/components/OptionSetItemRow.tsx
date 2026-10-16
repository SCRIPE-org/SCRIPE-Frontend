"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { TableCell, TableRow } from "@core/ui/table";
import { ArrowDown, ArrowUp, Ban, RotateCcw, Trash2 } from "lucide-react";
import { OptionSetStatusBadge } from "./OptionSetStatusBadge";
import {
  OPTION_SET_ITEM_COLOR_MAX_LENGTH,
  OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
} from "../form/optionSetItemRules";
import {
  type EditableTextField,
  type HintedTextField,
  type OptionSetDraftItem,
  isHintedTextField,
} from "./optionSetItemEditorTypes";
import type { OptionSetItemWritableStatus } from "../../domain/entities/OptionSetItem";

/**
 * Documentation for module export
 */
export interface OptionSetItemRowProps {
  row: OptionSetDraftItem;
  index: number;
  totalCount: number;
  isEditable: boolean;
  isMutable: boolean;
  baseId: string;
  messages: Partial<Record<EditableTextField, string>> | undefined;
  onTextFieldChange: (rowId: string, field: EditableTextField, raw: string) => void;
  onStatusChange: (rowId: string, status: OptionSetItemWritableStatus) => void;
  onMoveRow: (index: number, delta: -1 | 1) => void;
  onRemoveRow: (rowId: string) => void;
  deactivateNoteId: string;
  reactivateNoteId: string;
  hintId: (field: HintedTextField) => string;
}

/**
 * Documentation for OptionSetItemRow
 */
export function OptionSetItemRow({
  row,
  index,
  totalCount,
  isEditable,
  isMutable,
  baseId,
  messages,
  onTextFieldChange,
  onStatusChange,
  onMoveRow,
  onRemoveRow,
  deactivateNoteId,
  reactivateNoteId,
  hintId,
}: OptionSetItemRowProps) {
  const { t } = useI18n();
  const position = index + 1;
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  const renderTextCell = (
    field: EditableTextField,
    labelKey: string,
    placeholderKey: string | null,
    maxLength: number,
    direction: "ltr" | "rtl" | "auto"
  ) => {
    const inputId = `${baseId}-${row.rowId}-${field}`;
    const messageId = `${inputId}-message`;
    const message = messages?.[field];
    const describedBy = [
      message !== undefined ? messageId : null,
      isHintedTextField(field) ? hintId(field) : null,
    ].filter((id): id is string => id !== null);

    return (
      <TableCell className="align-top">
        <Label htmlFor={inputId} className="sr-only">
          {`${t(labelKey)} ${position}`}
        </Label>
        <Input
          id={inputId}
          value={row[field] ?? ""}
          onChange={(event) => onTextFieldChange(row.rowId, field, event.target.value)}
          placeholder={placeholderKey ? t(placeholderKey) : undefined}
          maxLength={maxLength}
          disabled={!isMutable}
          aria-invalid={message !== undefined || undefined}
          aria-describedby={describedBy.length > 0 ? describedBy.join(" ") : undefined}
          dir={direction}
          className="min-w-[8rem]"
        />
        {message !== undefined && (
          <p id={messageId} className="mt-1 text-xs text-destructive">
            {message}
          </p>
        )}
      </TableCell>
    );
  };

  const renderStaticCell = (value: string | null, direction: "ltr" | "rtl" | "auto") => (
    <TableCell className="align-top">
      {value && value.trim().length > 0 ? (
        <span dir={direction}>{value}</span>
      ) : (
        <span className="text-nx-ink-3">{t("common.none")}</span>
      )}
    </TableCell>
  );

  return (
    <TableRow key={row.rowId}>
      <TableCell className="align-top tabular-nums text-nx-ink-2">{position}</TableCell>

      {isEditable ? (
        <>
          {renderTextCell(
            "key",
            "optionSet.items.fields.key",
            "optionSet.items.placeholders.key",
            OPTION_SET_ITEM_KEY_MAX_LENGTH,
            "ltr"
          )}
          {renderTextCell(
            "labelEn",
            "optionSet.items.fields.labelEn",
            "optionSet.items.placeholders.labelEn",
            OPTION_SET_ITEM_LABEL_MAX_LENGTH,
            "ltr"
          )}
          {renderTextCell(
            "labelAr",
            "optionSet.items.fields.labelAr",
            "optionSet.items.placeholders.labelAr",
            OPTION_SET_ITEM_LABEL_MAX_LENGTH,
            "rtl"
          )}
          {renderTextCell(
            "color",
            "optionSet.items.fields.color",
            "optionSet.items.placeholders.color",
            OPTION_SET_ITEM_COLOR_MAX_LENGTH,
            "ltr"
          )}
          {renderTextCell(
            "iconKey",
            "optionSet.items.fields.iconKey",
            "optionSet.items.placeholders.iconKey",
            OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
            "ltr"
          )}
        </>
      ) : (
        <>
          {renderStaticCell(row.key, "ltr")}
          {renderStaticCell(row.labelEn, "ltr")}
          {renderStaticCell(row.labelAr, "rtl")}
          {renderStaticCell(row.color, "ltr")}
          {renderStaticCell(row.iconKey, "ltr")}
        </>
      )}

      <TableCell className="align-top">
        <OptionSetStatusBadge kind="option" status={row.status} />
      </TableCell>

      <TableCell className="align-top">
        {isEditable ? (
          <div className="flex items-center justify-end gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMoveRow(index, -1)}
              disabled={!isMutable || isFirst}
              aria-label={`${t("optionSet.items.moveUp")} ${position}`}
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMoveRow(index, 1)}
              disabled={!isMutable || isLast}
              aria-label={`${t("optionSet.items.moveDown")} ${position}`}
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>

            {row.id === null ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/80"
                onClick={() => onRemoveRow(row.rowId)}
                disabled={!isMutable}
                aria-label={`${t("optionSet.items.remove")} ${position}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            ) : row.status === "Active" ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onStatusChange(row.rowId, "Deactivated")}
                disabled={!isMutable}
                aria-label={`${t("optionSet.items.deactivate")} ${position}`}
                aria-describedby={deactivateNoteId}
              >
                <Ban className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onStatusChange(row.rowId, "Active")}
                disabled={!isMutable}
                aria-label={`${t("optionSet.items.reactivate")} ${position}`}
                aria-describedby={reactivateNoteId}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
