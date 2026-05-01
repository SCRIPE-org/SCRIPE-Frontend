/**
 * TestPingButton
 *
 * Sends a test webhook delivery and shows the result inline.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import type { WebhookTestResult } from "../../domain/entities/Webhook";
import { Zap, CheckCircle2, XCircle, Clock } from "lucide-react";

interface TestPingButtonProps {
  onTest: () => void;
  isTesting: boolean;
  testResult: WebhookTestResult | null;
  onDismiss: () => void;
}

export function TestPingButton({ onTest, isTesting, testResult, onDismiss }: TestPingButtonProps) {
  const { t } = useI18n();

  return (
    <Popover
      open={testResult !== null}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={onTest}
          loading={isTesting}
          className="gap-1.5"
        >
          {!isTesting && <Zap className="h-4 w-4 text-amber-500" />}
          {isTesting
            ? t("webhooks.testing") || "Testing..."
            : t("webhooks.testPing") || "Test Ping"}
        </Button>
      </PopoverTrigger>

      {testResult && (
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {testResult.isSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm font-semibold">
                {testResult.isSuccess
                  ? t("webhooks.testSuccess") || "Test Delivered Successfully"
                  : t("webhooks.testFailed") || "Test Delivery Failed"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("webhooks.httpCode") || "HTTP Status"}
                </p>
                <Badge
                  variant="outline"
                  className={`mt-0.5 font-mono text-xs ${
                    testResult.statusCode >= 200 && testResult.statusCode < 300
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {testResult.statusCode}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("webhooks.latency") || "Latency"}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{testResult.latencyMs.toFixed(0)}ms</span>
                </div>
              </div>
            </div>

            {testResult.errorMessage && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {t("webhooks.errorMessage") || "Error"}
                </p>
                <pre className="overflow-x-auto rounded border border-red-200 bg-red-50 p-2 text-xs dark:border-red-800 dark:bg-red-950/20">
                  {testResult.errorMessage}
                </pre>
              </div>
            )}

            {testResult.responsePreview && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">
                  {t("webhooks.responseBody") || "Response Preview"}
                </p>
                <pre className="max-h-60 overflow-x-auto whitespace-pre-wrap break-all rounded border bg-muted/50 p-2 text-xs">
                  {testResult.responsePreview}
                </pre>
              </div>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
