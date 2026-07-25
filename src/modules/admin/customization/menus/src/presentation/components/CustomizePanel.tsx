/**
 * Customize Panel
 *
 * Right panel: inline editing for the selected menu item's overrides.
 * Shows name EN/AR, order, parent picker, hidden toggle.
 * Includes base values as reference and save/reset buttons.
 */
"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { EmptyState } from "@core/ui/empty-state";
import type { MenuTreeNode, MenuItemOverrideInfo } from "../../domain/entities/MenuItem";
import type { OverrideFormData, FlatMenuItem } from "../viewmodels/useMenuCustomizeViewModel";
import {
  Save,
  RotateCcw,
  FileText,
  FolderOpen,
  EyeOff,
  Eye,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface CustomizePanelProps {
  selectedNode: MenuTreeNode | null;
  selectedOverride: MenuItemOverrideInfo | null;
  formData: OverrideFormData | null;
  parentOptions: FlatMenuItem[];
  language: string;
  onSave: (data: OverrideFormData) => void;
  isSaving: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CustomizePanel({
  selectedNode,
  selectedOverride,
  formData,
  parentOptions,
  language,
  onSave,
  isSaving,
}: CustomizePanelProps) {
  const { t, direction } = useI18n();
  // Shows a value transforming into another — must follow reading direction.
  const TransformIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  // Local form state
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [orderOverride, setOrderOverride] = useState<string>("");
  const [parentId, setParentId] = useState<string>("__none__");
  const [isHidden, setIsHidden] = useState(false);

  // Reset form when selection or override data changes
  const [prevFormData, setPrevFormData] = useState(formData);
  if (formData !== prevFormData) {
    setPrevFormData(formData);
    if (formData) {
      setNameEn(formData.nameEn);
      setNameAr(formData.nameAr);
      setOrderOverride(formData.orderOverride != null ? String(formData.orderOverride) : "");
      setParentId(formData.parentMenuItemIdOverride ?? "__none__");
      setIsHidden(formData.isHidden);
    }
  }

  // Check if form has changes compared to current override
  const hasChanges = useMemo(() => {
    if (!formData) return false;
    return (
      nameEn !== formData.nameEn ||
      nameAr !== formData.nameAr ||
      (orderOverride !== "" ? Number(orderOverride) : null) !== formData.orderOverride ||
      (parentId !== "__none__" ? parentId : null) !== formData.parentMenuItemIdOverride ||
      isHidden !== formData.isHidden
    );
  }, [nameEn, nameAr, orderOverride, parentId, isHidden, formData]);

  const handleSave = () => {
    onSave({
      nameEn,
      nameAr,
      orderOverride: orderOverride !== "" ? Number(orderOverride) : null,
      parentMenuItemIdOverride: parentId !== "__none__" ? parentId : null,
      isHidden,
    });
  };

  const handleReset = () => {
    if (formData) {
      setNameEn(formData.nameEn);
      setNameAr(formData.nameAr);
      setOrderOverride(formData.orderOverride != null ? String(formData.orderOverride) : "");
      setParentId(formData.parentMenuItemIdOverride ?? "__none__");
      setIsHidden(formData.isHidden);
    }
  };

  // ── Empty state ─────────────────────────────────────────────────────
  if (!selectedNode) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            bare
            size="sm"
            icon={FileText}
            title={t("menus.selectItemToCustomize")}
            description={t("menus.selectItemHint")}
          />
        </CardContent>
      </Card>
    );
  }

  const displayName = language === "ar" ? selectedNode.nameAr : selectedNode.nameEn;
  const hasChildren = selectedNode.children.length > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <FolderOpen className="h-5 w-5 shrink-0 text-nx-accent" aria-hidden="true" />
          ) : (
            <FileText className="h-5 w-5 shrink-0 text-nx-ink-3" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{displayName}</CardTitle>
            <p className="mt-0.5 text-xs text-nx-ink-3">{t("menus.customizeDesc")}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── Display Name Section ──────────────────── */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("menus.overrideRename")}
          </h4>

          <div className="space-y-2">
            <div>
              <Label htmlFor="nameEn" className="text-xs">
                {t("menus.nameEn")}
              </Label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder={selectedNode.nameEn}
                className="mt-1 h-8 text-sm"
              />
              {nameEn && nameEn !== selectedNode.nameEn && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-nx-ink-3">
                  <span className="line-through">{selectedNode.nameEn}</span>
                  <TransformIcon className="h-2.5 w-2.5" aria-hidden="true" />
                  <span className="font-medium text-nx-accent">{nameEn}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="nameAr" className="text-xs">
                {t("menus.nameAr")}
              </Label>
              <Input
                id="nameAr"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder={selectedNode.nameAr}
                className="mt-1 h-8 text-sm"
                dir="rtl"
              />
              {nameAr && nameAr !== selectedNode.nameAr && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-nx-ink-3">
                  <span className="line-through">{selectedNode.nameAr}</span>
                  <TransformIcon className="h-2.5 w-2.5" aria-hidden="true" />
                  <span className="font-medium text-nx-accent">{nameAr}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Display Order Section ─────────────────── */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("menus.overrideOrder")}
          </h4>
          <div>
            <Input
              type="number"
              value={orderOverride}
              onChange={(e) => setOrderOverride(e.target.value)}
              placeholder={String(selectedNode.order)}
              className="h-8 w-32 text-sm"
              min={0}
            />
            <p className="mt-1 text-[10px] text-nx-ink-3">{t("menus.orderHint")}</p>
          </div>
        </div>

        <Separator />

        {/* ── Parent Override Section ───────────────── */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("menus.overrideParent")}
          </h4>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger className="h-8 w-full text-sm">
              <SelectValue placeholder={t("menus.keepCurrentParent")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("menus.keepCurrentParent")}</SelectItem>
              <SelectItem value="__root__">{t("menus.rootLevel")}</SelectItem>
              {parentOptions.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <span style={{ paddingInlineStart: `${item.depth * 12}px` }}>
                    {language === "ar" ? item.nameAr : item.nameEn}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* ── Visibility Section ───────────────────── */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("menus.visibility")}
          </h4>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div className="flex items-center gap-2">
              {isHidden ? (
                <EyeOff className="h-4 w-4 text-destructive" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-success" aria-hidden="true" />
              )}
              <span className="text-sm text-nx-ink">
                {isHidden ? t("menus.itemHidden") : t("menus.itemVisible")}
              </span>
            </div>
            <Switch checked={!isHidden} onCheckedChange={(checked) => setIsHidden(!checked)} />
          </div>
        </div>

        <Separator />

        {/* ── Actions ──────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            loading={isSaving}
            className="flex-1"
            size="sm"
          >
            {!isSaving && <Save className="me-1.5 h-4 w-4" aria-hidden="true" />}
            {t("common.save")}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges} size="sm">
            <RotateCcw className="me-1.5 h-4 w-4" aria-hidden="true" />
            {t("common.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
