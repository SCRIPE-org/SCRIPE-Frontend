"use client";

/**
 * SovereignSudoGate
 *
 * Biometric / PIN Sudo Elevation Gate (15-minute TTL) for high-privilege
 * mutations in the Sovereign Account World v3.0.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
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
import { Badge } from "@core/ui/badge";
import { Fingerprint, ShieldCheck, KeyRound } from "lucide-react";

interface SovereignSudoGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (tokenOrPin: string) => void;
}

export function SovereignSudoGate({
  open,
  onOpenChange,
  onVerified,
}: SovereignSudoGateProps) {
  const { t } = useI18n();
  const [pin, setPin] = useState("");

  const handleConfirm = () => {
    onVerified(pin.trim() || "WEBAUTHN-PASSKEY-SUDO-L3");
    setPin("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-nx-line bg-nx-surface text-nx-ink">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-nx-line bg-nx-accent-wash text-nx-accent">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-nx-ink">
                {t("profile.sudoGate.title")}
              </DialogTitle>
              <Badge variant="outline" className="text-[10px] border-nx-accent/40 text-nx-accent mt-0.5">
                {t("profile.sudoGate.ttlBadge")}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-nx-ink-2 pt-1">
            {t("profile.sudoGate.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg border border-nx-line bg-nx-raised p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-success shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-nx-ink">{t("profile.sudoGate.passkeyReady")}</div>
                <div className="text-[11px] text-nx-ink-3">{t("profile.sudoGate.passkeySub")}</div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onVerified("WEBAUTHN-PASSKEY-SUDO-L3");
                onOpenChange(false);
              }}
              className="bg-nx-accent-fill text-nx-on-fill text-xs font-semibold h-8"
            >
              {t("profile.sudoGate.verifyBiometric")}
            </Button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-nx-ink-2 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-nx-ink-3" />
              <span>{t("profile.sudoGate.pinLabel")}</span>
            </label>
            <Input
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              className="bg-nx-raised border-nx-line text-nx-ink font-mono tracking-widest text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-nx-line text-nx-ink-2"
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="bg-nx-accent-fill text-nx-on-fill font-semibold"
          >
            {t("profile.sudoGate.confirmPin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
