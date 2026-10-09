"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { Edit3, Lock, Loader2 } from "lucide-react";
import type { Party } from "../../../domain/entities/Party";

interface EditPartyDialogProps {
  party: Party | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, displayName: string) => Promise<void>;
}

function EditPartyForm({
  party,
  onClose,
  onSubmit,
}: {
  party: Party;
  onClose: () => void;
  onSubmit: (id: string, displayName: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState(party.displayName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError(t("party.dialog.nameRequired") || "Display name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(party.id, trimmed);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update party";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nx-accent/10 text-nx-accent">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>{t("party.dialog.editNameTitle")}</DialogTitle>
            <DialogDescription>
              {t("party.dialog.editNameDesc")}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Immutable Identity Attributes Info */}
        <div className="flex items-center justify-between rounded-lg bg-nx-surface-2 p-3 text-xs border border-nx-border">
          <div className="space-y-1">
            <span className="text-nx-ink-3 block">
              {t("party.profile.immutableType")}
            </span>
            <Badge variant={party.isPerson ? "info" : "success"}>
              {party.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-nx-ink-3">
            <Lock className="h-3.5 w-3.5" />
            <span>ADR-002 Locked</span>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="grid gap-2">
          <Label htmlFor="edit-party-name" className="text-nx-ink font-medium">
            {t("party.dialog.displayName")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-party-name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (error) setError(null);
            }}
            disabled={isSubmitting}
            autoFocus
            required
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t("party.dialog.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting || !displayName.trim()}>
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
  );
}

export function EditPartyDialog({
  party,
  open,
  onOpenChange,
  onSubmit,
}: EditPartyDialogProps) {
  if (!party) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <EditPartyForm
          key={party.id}
          party={party}
          onClose={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
