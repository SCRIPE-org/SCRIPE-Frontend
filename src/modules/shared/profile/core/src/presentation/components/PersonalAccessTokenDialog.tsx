"use client";

/**
 * PersonalAccessTokenDialog
 *
 * Developer Token generator wizard for SCRIPE REST API automation.
 * Configures token name, expiration TTL, granular OAuth2/RBAC scopes,
 * and renders generated plaintext secret once with warning.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Checkbox } from "@core/ui/checkbox";
import { KeyRound, Copy, Check, ShieldAlert, CheckCircle2 } from "lucide-react";

interface PersonalAccessTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { name: string; scopes: string[]; expiresInDays: number }) => void;
  createdSecret: string | null;
  onClearSecret: () => void;
}

const AVAILABLE_SCOPES = [
  { id: "academy:read", labelKey: "profile.pat.scopes.academyRead" },
  { id: "athletes:read", labelKey: "profile.pat.scopes.athletesRead" },
  { id: "tactics:read", labelKey: "profile.pat.scopes.tacticsRead" },
  { id: "pitch:write", labelKey: "profile.pat.scopes.pitchWrite" },
  { id: "admin:all", labelKey: "profile.pat.scopes.adminAll" },
];

export function PersonalAccessTokenDialog({
  isOpen,
  onClose,
  onGenerate,
  createdSecret,
  onClearSecret,
}: PersonalAccessTokenDialogProps) {
  const { t } = useI18n();
  const [tokenName, setTokenName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["academy:read"]);
  const [copied, setCopied] = useState(false);

  const handleToggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleGenerate = () => {
    if (!tokenName.trim()) return;
    onGenerate({
      name: tokenName.trim(),
      scopes: selectedScopes,
      expiresInDays: parseInt(expiresInDays, 10) || 30,
    });
  };

  const handleCopy = () => {
    if (!createdSecret) return;
    navigator.clipboard.writeText(createdSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setTokenName("");
    setExpiresInDays("30");
    setSelectedScopes(["academy:read"]);
    onClearSecret();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-nx-surface border-nx-line p-6">
        {!createdSecret ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-nx-accent-wash text-nx-accent border border-nx-accent/20 flex items-center justify-center">
                  <KeyRound className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <DialogTitle className="text-base font-bold text-nx-ink">
                  {t("profile.pat.dialogTitle")}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.pat.dialogDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pat-name" className="text-xs font-semibold text-nx-ink">
                  {t("profile.pat.tokenNameLabel")}
                </Label>
                <Input
                  id="pat-name"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder={t("profile.pat.namePlaceholder")}
                  className="text-xs h-9 bg-nx-surface border-nx-line text-nx-ink"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-nx-ink">
                  {t("profile.pat.expirationLabel")}
                </Label>
                <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                  <SelectTrigger className="w-full text-xs h-9 bg-nx-surface border-nx-line text-nx-ink">
                    <SelectValue placeholder={t("profile.pat.selectExpiry")} />
                  </SelectTrigger>
                  <SelectContent className="bg-nx-surface border-nx-line">
                    <SelectItem value="30" className="text-xs">{t("profile.pat.expiry30Days")}</SelectItem>
                    <SelectItem value="60" className="text-xs">{t("profile.pat.expiry60Days")}</SelectItem>
                    <SelectItem value="90" className="text-xs">{t("profile.pat.expiry90Days")}</SelectItem>
                    <SelectItem value="365" className="text-xs">{t("profile.pat.expiry365Days")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold text-nx-ink">
                  {t("profile.pat.scopesLabel")}
                </Label>
                <div className="space-y-2 p-3 rounded-xl border border-nx-line bg-nx-raised">
                  {AVAILABLE_SCOPES.map((scope) => (
                    <div key={scope.id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`scope-${scope.id}`}
                        checked={selectedScopes.includes(scope.id)}
                        onCheckedChange={() => handleToggleScope(scope.id)}
                      />
                      <Label
                        htmlFor={`scope-${scope.id}`}
                        className="text-xs text-nx-ink cursor-pointer select-none font-normal"
                      >
                        {t(scope.labelKey)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={handleClose} className="text-xs">
                {t("profile.common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={!tokenName.trim() || selectedScopes.length === 0}
                className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill hover:bg-nx-accent-fill/90"
              >
                {t("profile.pat.generateBtn")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <DialogTitle className="text-base font-bold text-nx-ink">
                  {t("profile.pat.generatedTitle")}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.pat.generatedDesc")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" style={{ minWidth: 16, minHeight: 16 }} />
                <p>{t("profile.pat.generatedWarning")}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-xs font-semibold px-3 py-2.5 rounded-lg bg-nx-raised border border-nx-line text-nx-ink truncate select-all">
                  {createdSecret}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-10 px-3 text-xs gap-1.5 shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? t("profile.common.copied") : t("profile.common.copy")}</span>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={handleClose} className="w-full text-xs font-semibold bg-nx-accent-fill text-nx-on-fill hover:bg-nx-accent-fill/90">
                {t("profile.common.done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
