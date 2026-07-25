import { useState } from "react";
import { Lock, AlertTriangle, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@/core/providers/i18n-provider";
import { Button } from "@/core/ui/button";

interface GeneratedKeyDialogProps {
  generatedKey: string | null;
  onClose: () => void;
}

export function GeneratedKeyDialog({ generatedKey, onClose }: GeneratedKeyDialogProps) {
  const { t } = useI18n();
  const { success } = useEnhancedToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      success({
        title: t("apikeys.copied"),
        description: t("apikeys.copiedDesc"),
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={!!generatedKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center">{t("apikeys.created")}</DialogTitle>
          <DialogDescription className="text-center">{t("apikeys.createdDesc")}</DialogDescription>
        </DialogHeader>

        {/* Secure Display Pane */}
        <div className="mt-4 flex gap-3 rounded-nx-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t("apikeys.plainKeyWarning")}</p>
            <p className="mt-0.5 text-xs opacity-90">{t("apikeys.plainKeyDesc")}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <label htmlFor="generated-api-key" className="sr-only">
              {t("apikeys.plainKeyLabel")}
            </label>
            <Input
              id="generated-api-key"
              type="text"
              readOnly
              value={generatedKey || ""}
              className="select-all font-mono text-sm"
            />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">{t("common.copy")}</span>
            {copied ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("apikeys.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
