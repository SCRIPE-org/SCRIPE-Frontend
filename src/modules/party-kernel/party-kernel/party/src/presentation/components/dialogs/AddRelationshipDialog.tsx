"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { Users, Loader2 } from "lucide-react";

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    targetPartyId: string;
    relationshipType: string;
    validFrom?: string;
    validTo?: string;
  }) => Promise<string>;
  defaultRelationshipType?: string;
  title?: string;
}

export function AddRelationshipDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultRelationshipType = "",
  title,
}: AddRelationshipDialogProps) {
  const { t } = useI18n();

  const [targetPartyId, setTargetPartyId] = useState("");
  const [relationshipType, setRelationshipType] = useState(defaultRelationshipType);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync defaultRelationshipType when opened
  useEffect(() => {
    if (open && defaultRelationshipType) {
      setRelationshipType(defaultRelationshipType);
    }
  }, [open, defaultRelationshipType]);

  const resetForm = () => {
    setTargetPartyId("");
    setRelationshipType(defaultRelationshipType);
    setValidFrom("");
    setValidTo("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPartyId.trim()) {
      setError("Target Party ID is required");
      return;
    }
    if (!relationshipType.trim()) {
      setError("Relationship type is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        targetPartyId: targetPartyId.trim(),
        relationshipType: relationshipType.trim(),
        validFrom: validFrom || undefined,
        validTo: validTo || undefined,
      });
      handleClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to establish relationship";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nx-accent/10 text-nx-accent">
                <Users className="h-5 w-5" />
              </div>
              <DialogTitle>
                {title || t("party.dialog.addRelTitle")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="rel-target" className="text-nx-ink font-medium">
                {t("party.dialog.targetPartyId")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rel-target"
                value={targetPartyId}
                onChange={(e) => {
                  setTargetPartyId(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Target party identifier"
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rel-type" className="text-nx-ink font-medium">
                {t("party.dialog.relType")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rel-type"
                value={relationshipType}
                onChange={(e) => {
                  setRelationshipType(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t("party.dialog.relPlaceholder")}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rel-from" className="text-nx-ink text-xs">
                  {t("party.dialog.validFrom")}
                </Label>
                <Input
                  id="rel-from"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rel-to" className="text-nx-ink text-xs">
                  {t("party.dialog.validTo")}
                </Label>
                <Input
                  id="rel-to"
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("party.dialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !targetPartyId.trim() || !relationshipType.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("party.dialog.save")}...
                </>
              ) : (
                t("party.dialog.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
