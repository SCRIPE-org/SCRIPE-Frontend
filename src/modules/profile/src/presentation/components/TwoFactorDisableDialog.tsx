"use client";

/**
 * TwoFactorDisableDialog
 *
 * Confirmation dialog that requires the user's current password
 * to disable 2FA on their account.
 */
import { useState, useCallback } from "react";
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
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ShieldX, Eye, EyeOff } from "lucide-react";

interface TwoFactorDisableDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onDisable: (password: string) => Promise<void>;
      isDisabling: boolean;
      disableError: string | null;
}

export function TwoFactorDisableDialog({
      open,
      onOpenChange,
      onDisable,
      isDisabling,
      disableError,
}: TwoFactorDisableDialogProps) {
      const { t } = useI18n();
      const [password, setPassword] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [error, setError] = useState("");

      const handleDisable = useCallback(async () => {
            if (!password.trim()) {
                  setError(t("profile.security.twoFactor.disable.passwordRequired"));
                  return;
            }
            setError("");
            try {
                  await onDisable(password);
                  setPassword("");
                  setError("");
            } catch (err) {
                  setError(
                        err instanceof Error
                              ? err.message
                              : t("profile.security.twoFactor.disable.failed")
                  );
            }
      }, [password, onDisable, t]);

      const handleClose = useCallback(
            (isOpen: boolean) => {
                  if (!isOpen) {
                        setPassword("");
                        setError("");
                        setShowPassword(false);
                  }
                  onOpenChange(isOpen);
            },
            [onOpenChange]
      );

      return (
            <Dialog open={open} onOpenChange={handleClose}>
                  <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                              <div className="flex items-center gap-2">
                                    <ShieldX className="h-5 w-5 text-destructive" />
                                    <DialogTitle>
                                          {t("profile.security.twoFactor.disable.title")}
                                    </DialogTitle>
                              </div>
                              <DialogDescription>
                                    {t("profile.security.twoFactor.disable.description")}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                              {(error || disableError) && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                          {error || disableError}
                                    </div>
                              )}

                              <div className="space-y-2">
                                    <Label htmlFor="disable-2fa-password">
                                          {t("profile.security.twoFactor.disable.passwordLabel")}
                                    </Label>
                                    <div className="relative">
                                          <Input
                                                id="disable-2fa-password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="h-12 pe-12"
                                                disabled={isDisabling}
                                                onKeyDown={(e) => {
                                                      if (e.key === "Enter" && password.trim()) {
                                                            handleDisable();
                                                      }
                                                }}
                                                autoFocus
                                          />
                                          <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute end-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isDisabling}
                                          >
                                                {showPassword ? (
                                                      <EyeOff className="h-4 w-4" />
                                                ) : (
                                                      <Eye className="h-4 w-4" />
                                                )}
                                          </Button>
                                    </div>
                              </div>
                        </div>

                        <DialogFooter>
                              <Button
                                    variant="outline"
                                    onClick={() => handleClose(false)}
                                    disabled={isDisabling}
                              >
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    variant="destructive"
                                    onClick={handleDisable}
                                    disabled={isDisabling || !password.trim()}
                              >
                                    {isDisabling ? (
                                          <div className="flex items-center gap-2">
                                                <LoadingSpinner size="inline" showText={false} />
                                                <span>{t("common.loading")}</span>
                                          </div>
                                    ) : (
                                          t("profile.security.twoFactor.disable.confirm")
                                    )}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
