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
        title: t("apikeys.copied") || "Copied!",
        description: t("apikeys.copiedDesc") || "API key copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={!!generatedKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">{t("apikeys.created") || "API Key Generated"}</DialogTitle>
          <DialogDescription className="text-center">
            {t("apikeys.createdDesc") ||
              "API Key has been created. Please copy the plain-text token below and store it securely. For security reasons, you will NOT be able to view this token again."}
          </DialogDescription>
        </DialogHeader>

        {/* Secure Display Pane */}
        <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 flex gap-3 text-sm text-yellow-800 dark:text-yellow-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{t("apikeys.plainKeyWarning") || "Keep this key secret."}</p>
            <p className="text-xs mt-0.5 opacity-90">
              {t("apikeys.plainKeyDesc") || "Anyone with access can invoke APIs with its permissions."}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <label htmlFor="generated-api-key" className="sr-only">
              {t("apikeys.plainKeyLabel") || "API Key Token"}
            </label>
            <input
              id="generated-api-key"
              type="text"
              readOnly
              value={generatedKey || ""}
              className="w-full font-mono text-sm px-3 py-2 bg-muted rounded border outline-none select-all"
            />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <DialogFooter className="sm:justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("apikeys.close") || "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
