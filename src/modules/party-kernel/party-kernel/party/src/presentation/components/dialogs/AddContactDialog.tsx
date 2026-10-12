"use client";

import { useState } from "react";
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
import { Checkbox } from "@core/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { Phone, Loader2 } from "lucide-react";
import type { AddContactPointParams } from "../../../domain/interfaces/IPartyRepository";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<AddContactPointParams, "partyId">) => Promise<string>;
}

/**
 * Modal dialog for registering a new contact method on a party.
 */
export function AddContactDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddContactDialogProps) {
  const { t } = useI18n();

  const [type, setType] = useState("Phone");
  const [value, setValue] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setType("Phone");
    setValue("");
    setIsPrimary(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Contact value is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      let mappedType = type;
      if (type.toLowerCase() === "phone" || type.toLowerCase() === "mobile") mappedType = "Phone";
      else if (type.toLowerCase() === "email") mappedType = "Email";
      else if (type.toLowerCase() === "fax") mappedType = "Fax";
      else mappedType = "Other";

      await onSubmit({
        type: mappedType,
        value: value.trim(),
        isPrimary,
      });
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add contact";
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
                <Phone className="h-5 w-5" />
              </div>
              <DialogTitle>{t("party.dialog.addContactTitle")}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="contact-type" className="text-nx-ink font-medium">
                {t("party.dialog.contactType")}
              </Label>
              <Select value={type} onValueChange={setType} disabled={isSubmitting}>
                <SelectTrigger id="contact-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Fax">Fax</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact-val" className="text-nx-ink font-medium">
                {t("party.dialog.contactValue")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact-val"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={type === "Email" ? "name@domain.com" : "+966 5x xxx xxxx"}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="contact-is-primary"
                checked={isPrimary}
                onCheckedChange={(c) => setIsPrimary(c === true)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="contact-is-primary"
                className="text-xs text-nx-ink cursor-pointer"
              >
                {t("party.dialog.isPrimaryContact")}
              </Label>
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
            <Button type="submit" disabled={isSubmitting || !value.trim()}>
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
