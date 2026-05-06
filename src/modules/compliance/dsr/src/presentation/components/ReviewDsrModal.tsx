"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { GenericModal } from "@core/crud/components/generic-modal";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReviewDsrModalProps {
  dsr: DataSubjectRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReview: (id: string, approved: boolean, resolution?: string) => Promise<void>;
  isReviewing: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReviewDsrModal({ dsr, open, onOpenChange, onReview, isReviewing }: ReviewDsrModalProps) {
  const { t } = useI18n();
  const [resolution, setResolution] = useState("");
  const [decision, setDecision] = useState<boolean | null>(null);

  const handleReview = async (approved: boolean) => {
    if (!dsr) return;
    setDecision(approved);
    await onReview(dsr.id, approved, resolution || undefined);
    onOpenChange(false);
    setResolution("");
    setDecision(null);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${t("compliance.approveDsr")} / ${t("compliance.rejectDsr")}`}
      description={dsr ? `${dsr.subjectEmail} · ${dsr.requestType} · ${dsr.regulationCode}` : ""}
      size="sm"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="review-resolution">{t("compliance.resolution")}</Label>
          <Textarea
            id="review-resolution"
            placeholder={t("compliance.resolutionPlaceholder")}
            rows={3}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            id="dsr-reject-btn"
            disabled={isReviewing}
            onClick={() => handleReview(false)}
          >
            <ThumbsDown className="me-2 h-4 w-4" />
            {isReviewing && decision === false ? t("common.loading") : t("compliance.rejectDsr")}
          </Button>
          <Button
            id="dsr-approve-btn"
            className="gradient-primary"
            disabled={isReviewing}
            onClick={() => handleReview(true)}
          >
            <ThumbsUp className="me-2 h-4 w-4" />
            {isReviewing && decision === true ? t("common.loading") : t("compliance.approveDsr")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
