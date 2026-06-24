// FILE-EXCEPTION: file length
"use client";

import { JSX, useState } from "react";
import { useOptionsEditorViewModel } from "../viewmodels/useOptionsEditorViewModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, X, Check } from "lucide-react";
import type { AnswerOptionData } from "../../domain/entities/OnboardingQuestion";
import type { AnswerOptionRequest } from "../../domain/entities/OnboardingQuestionRequests";

interface OptionsEditorDialogProps {
  open: boolean;
  onClose: () => void;
  questionId: string | null;
  questionLabel: string;
}

type EditorMode = { kind: "idle" } | { kind: "add" } | { kind: "edit"; option: AnswerOptionData };

const SIGNAL_WEIGHT_MIN = 0;
const SIGNAL_WEIGHT_MAX = 100;

const emptyForm = (): AnswerOptionRequest => ({
  value: "",
  labelEn: "",
  labelAr: "",
  sublabelEn: "",
  sublabelAr: "",
  sortOrder: 10,
  signalWeight: 1,
});

export function OptionsEditorDialog({
  open,
  onClose,
  questionId,
  questionLabel,
}: OptionsEditorDialogProps) {
  const vm = useOptionsEditorViewModel(open ? questionId : null);
  const { t } = useI18n();
  const [mode, setMode] = useState<EditorMode>({ kind: "idle" });
  const [form, setForm] = useState<AnswerOptionRequest>(emptyForm());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const isBusy = vm.isLoading || vm.isMutating;

  const startAdd = () => {
    if (isBusy) return;
    setForm({ ...emptyForm(), sortOrder: (vm.options.length + 1) * 10 });
    setMode({ kind: "add" });
  };

  const startEdit = (option: AnswerOptionData) => {
    if (isBusy) return;
    setForm({
      value: option.value,
      labelEn: option.labelEn,
      labelAr: option.labelAr,
      sublabelEn: option.sublabelEn ?? "",
      sublabelAr: option.sublabelAr ?? "",
      iconKey: option.iconKey ?? "",
      sortOrder: option.sortOrder,
      signalWeight: option.signalWeight,
    });
    setMode({ kind: "edit", option });
  };

  const cancelForm = () => {
    setMode({ kind: "idle" });
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (isBusy) return;
    const payload: AnswerOptionRequest = {
      ...form,
      sublabelEn: form.sublabelEn || undefined,
      sublabelAr: form.sublabelAr || undefined,
      iconKey: form.iconKey || undefined,
    };
    if (mode.kind === "add") {
      await vm.createOption(payload);
    } else if (mode.kind === "edit") {
      await vm.updateOption(mode.option.id, payload);
    }
    cancelForm();
  };

  const handleDelete = async (id: string) => {
    if (isBusy) return;
    await vm.deleteOption(id);
    setPendingDelete(null);
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0 || isBusy) return;
    const ids = vm.options.map((o) => o.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    await vm.reorderOptions(ids);
  };

  const handleMoveDown = async (idx: number) => {
    if (idx === vm.options.length - 1 || isBusy) return;
    const ids = vm.options.map((o) => o.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    await vm.reorderOptions(ids);
  };

  const field = (f: keyof AnswerOptionRequest, label: string, type: "text" | "number" = "text") => (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-zinc-400">{label}</Label>
      <Input
        type={type}
        value={String(form[f] ?? "")}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            [f]: type === "number" ? Number(e.target.value) : e.target.value,
          }))
        }
        className="h-8 border-zinc-700 bg-zinc-900 text-sm text-white placeholder:text-zinc-600"
        min={f === "signalWeight" ? SIGNAL_WEIGHT_MIN : undefined}
        max={f === "signalWeight" ? SIGNAL_WEIGHT_MAX : undefined}
        disabled={isBusy}
      />
    </div>
  );

  const isSaving = vm.isCreating || vm.isUpdating;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !isBusy && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-zinc-800 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-white">
            {t("entitlements.onboarding.questions.options.title")}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {t("entitlements.onboarding.questions.options.description")}{" "}
            <span className="font-medium text-zinc-200">{questionLabel}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Options list */}
        <div className="mt-2 space-y-1">
          {vm.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-md border border-zinc-800 bg-zinc-900/60"
              />
            ))
          ) : vm.options.length === 0 && mode.kind === "idle" ? (
            <p className="py-6 text-center text-sm text-zinc-600">
              {t("entitlements.onboarding.questions.options.empty")}
            </p>
          ) : (
            vm.options.map((opt, idx) => {
              const isEditing = mode.kind === "edit" && mode.option.id === opt.id;
              const isConfirmDelete = pendingDelete === opt.id;
              return (
                <div key={opt.id}>
                  <div
                    className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 transition-colors ${isEditing ? "border-indigo-500/50 bg-indigo-500/10" : "border-zinc-800 bg-zinc-900/60"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{opt.labelEn}</p>
                      <p className="truncate text-[11px] text-zinc-500">
                        {opt.value}
                        {opt.labelAr && ` · ${opt.labelAr}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {/* Reorder */}
                      <Button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0 || isBusy}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                        aria-label={t("entitlements.onboarding.questions.options.moveUp")}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === vm.options.length - 1 || isBusy}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30"
                        aria-label={t("entitlements.onboarding.questions.options.moveDown")}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>

                      {/* Edit */}
                      <Button
                        onClick={() => (isEditing ? cancelForm() : startEdit(opt))}
                        disabled={isBusy}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                        aria-label={t("entitlements.onboarding.questions.options.edit")}
                      >
                        {isEditing ? (
                          <X className="h-3.5 w-3.5" />
                        ) : (
                          <Pencil className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {/* Delete */}
                      {isConfirmDelete ? (
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => handleDelete(opt.id)}
                            disabled={isBusy}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                            aria-label={t(
                              "entitlements.onboarding.questions.options.confirmDelete"
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => setPendingDelete(null)}
                            disabled={isBusy}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:bg-zinc-800"
                            aria-label={t("entitlements.onboarding.questions.options.cancelDelete")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setPendingDelete(opt.id)}
                          disabled={isBusy}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                          aria-label={t("entitlements.onboarding.questions.options.delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="mt-1 rounded-md border border-indigo-500/30 bg-zinc-900/80 p-3">
                      <OptionForm
                        field={field}
                        onSave={handleSave}
                        onCancel={cancelForm}
                        isSaving={isSaving}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add form */}
        {mode.kind === "add" && (
          <div className="mt-2 rounded-md border border-emerald-500/30 bg-zinc-900/80 p-3">
            <p className="mb-3 text-xs font-medium text-emerald-400">
              {t("entitlements.onboarding.questions.options.new")}
            </p>
            <OptionForm
              field={field}
              onSave={handleSave}
              onCancel={cancelForm}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
          {mode.kind === "idle" ? (
            <Button
              onClick={startAdd}
              size="sm"
              disabled={isBusy}
              className="h-8 border border-dashed border-emerald-500/50 bg-transparent px-3 text-xs text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t("entitlements.onboarding.questions.options.add")}
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            disabled={isBusy}
            className="h-8 px-3 text-xs text-zinc-400 hover:text-white"
          >
            {t("entitlements.onboarding.questions.options.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Reusable form fields section (extracted to avoid duplication) ──────────────

interface OptionFormProps {
  field: (f: keyof AnswerOptionRequest, label: string, type?: "text" | "number") => JSX.Element;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function OptionForm({ field, onSave, onCancel, isSaving }: OptionFormProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {field("value", t("entitlements.onboarding.questions.options.value"))}
        {field("labelEn", t("entitlements.onboarding.questions.options.labelEn"))}
        {field("labelAr", t("entitlements.onboarding.questions.options.labelAr"))}
        {field("sublabelEn", t("entitlements.onboarding.questions.options.sublabelEn"))}
        {field("sublabelAr", t("entitlements.onboarding.questions.options.sublabelAr"))}
        {field("iconKey", t("entitlements.onboarding.questions.options.iconKey"))}
        {field("sortOrder", t("entitlements.onboarding.questions.options.sortOrder"), "number")}
        {field(
          "signalWeight",
          t("entitlements.onboarding.questions.options.signalWeight"),
          "number"
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="h-7 px-3 text-xs text-zinc-300 hover:text-white"
          disabled={isSaving}
        >
          {t("entitlements.onboarding.questions.options.cancel")}
        </Button>
        <Button
          onClick={onSave}
          size="sm"
          disabled={isSaving}
          className="h-7 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-500"
        >
          {isSaving
            ? t("entitlements.onboarding.questions.options.saving")
            : t("entitlements.onboarding.questions.options.save")}
        </Button>
      </div>
    </div>
  );
}
