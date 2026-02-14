"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive" className="glass border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="mt-2 text-base">{message}</AlertDescription>
        </Alert>

        {onRetry && (
          <div className="text-center">
            <Button onClick={onRetry} variant="outline" className="hover-lift bg-transparent">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("common.retry")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
