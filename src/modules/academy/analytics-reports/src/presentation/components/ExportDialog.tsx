"use client";

import React, { useState } from "react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (dataset: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function ExportDialog({ isOpen, onClose, onDownload, t }: ExportDialogProps) {
  const [dataset, setDataset] = useState<string>("athletes");

  if (!isOpen) return null;

  const datasets = [
    { id: "athletes", label: t("exportDialog.datasetAthletes"), desc: "Deduplicated athlete profiles, status, DOB year, medical clearance flag" },
    { id: "enrollments", label: t("exportDialog.datasetEnrollments"), desc: "Active & historical enrollments, offerings, branch scopes, finance invoice refs" },
    { id: "groups", label: t("exportDialog.datasetGroups"), desc: "Training groups, capacities, active roster headcount, fill rate %" },
    { id: "trials", label: t("exportDialog.datasetTrials"), desc: "Trial pipeline records, evaluation outcomes, conversion timestamps" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between border-b border-nx-line pb-3">
          <h2 className="text-base font-semibold text-nx-ink">
            {t("exportDialog.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-nx-ink-3 hover:text-nx-ink transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-nx-ink-2 leading-relaxed">
          {t("exportDialog.description")}
        </p>

        {/* Dataset Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-nx-ink uppercase tracking-wider">
            {t("exportDialog.datasetLabel")}
          </label>
          <div className="space-y-2">
            {datasets.map((d) => (
              <label
                key={d.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  dataset === d.id
                    ? "border-nx-accent bg-nx-accent/5 text-nx-ink"
                    : "border-nx-line bg-nx-ground/40 text-nx-ink-2 hover:bg-nx-raised/30"
                }`}
              >
                <input
                  type="radio"
                  name="exportDataset"
                  value={d.id}
                  checked={dataset === d.id}
                  onChange={() => setDataset(d.id)}
                  className="mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-semibold block">{d.label}</span>
                  <span className="text-[11px] text-nx-ink-3 block mt-0.5">{d.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Safeguarding & Security Notice */}
        <div className="rounded-lg border border-nx-line bg-nx-ground/60 p-3 space-y-2 text-[11px] text-nx-ink-2">
          <div className="flex items-center gap-1.5 font-medium text-emerald-500">
            <span>🛡️</span>
            <span>{t("exportDialog.piiNotice")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-nx-ink-3">
            <span>🔒</span>
            <span>{t("exportDialog.csvSanitizationNotice")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-nx-line">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-nx-line bg-nx-surface px-4 py-2 text-xs font-medium text-nx-ink transition-colors hover:bg-nx-raised"
          >
            {t("exportDialog.cancel")}
          </button>
          <button
            type="button"
            onClick={() => onDownload(dataset)}
            className="rounded-md bg-nx-accent px-4 py-2 text-xs font-semibold text-nx-ink transition-opacity hover:opacity-90 shadow-sm"
          >
            {t("exportDialog.download")}
          </button>
        </div>
      </div>
    </div>
  );
}
