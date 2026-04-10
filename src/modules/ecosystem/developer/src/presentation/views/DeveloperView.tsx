"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Code2, Webhook, BookOpen, Send, Loader2, RefreshCw } from "lucide-react";
import { useDeveloperViewModel } from "../viewmodels/useDeveloperViewModel";

export function DeveloperView() {
  useModuleLocales(() => import("../../../locales"), "developer");
  const { t } = useI18n();
  const vm = useDeveloperViewModel();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;
    setIsTesting(true);
    try {
      const result = await vm.testWebhook(webhookUrl);
      setWebhookResult(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setWebhookResult(JSON.stringify({ error: err.message ?? "Webhook test failed" }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  const overview = vm.overview as any;
  const webhookEvents = (vm.webhookEvents ?? []) as any[];
  const sdkExamples = (vm.sdkExamples ?? {}) as Record<string, any>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
          <Code2 className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("developer.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("developer.description")}</p>
        </div>
      </div>

      {/* API Overview — from server */}
      {vm.isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : vm.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{t("common.errorLoading")}</p>
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />{t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{overview?.apiVersion ?? "v1"}</p><p className="text-xs text-muted-foreground">{t("developer.apiVersion")}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{overview?.moduleCount ?? "—"}</p><p className="text-xs text-muted-foreground">{t("developer.modules")}</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{overview?.authMethod ?? "JWT"}</p><p className="text-xs text-muted-foreground">{t("developer.authMethod")}</p></CardContent></Card>
            <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20"><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-emerald-500">{overview?.healthStatus === "Healthy" ? "●" : "○"}</p><p className="text-xs text-muted-foreground">{t("developer.platformHealth")}</p></CardContent></Card>
          </div>

          {/* Webhook Tester — real API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-violet-500" />{t("developer.webhookTester")}</CardTitle>
              <CardDescription>{t("developer.webhookTesterDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input placeholder="https://your-webhook-url.com/hook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="flex-1 font-mono text-sm" />
                <Button onClick={handleTestWebhook} disabled={isTesting || !webhookUrl} className="gap-2">
                  {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t("developer.sendTest")}
                </Button>
              </div>
              {/* Available events — from server */}
              <div className="flex flex-wrap gap-2">
                {webhookEvents.map((e: any) => (
                  <Badge key={e.type ?? e} variant="outline" className="font-mono text-xs cursor-pointer hover:bg-accent">{e.type ?? e}</Badge>
                ))}
              </div>
              {webhookResult && (
                <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-sm overflow-auto max-h-[200px]">{webhookResult}</pre>
              )}
            </CardContent>
          </Card>

          {/* SDK Examples — from server */}
          {Object.keys(sdkExamples).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-500" />{t("developer.sdkExamples")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={Object.keys(sdkExamples)[0]}>
                  <TabsList>
                    {Object.keys(sdkExamples).map((lang) => (
                      <TabsTrigger key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(sdkExamples).map(([lang, examples]: [string, any]) => (
                    <TabsContent key={lang} value={lang} className="space-y-3">
                      {Object.entries(examples as Record<string, string>).map(([name, code]) => (
                        <div key={name}>
                          <h4 className="text-sm font-semibold mb-1">{name.charAt(0).toUpperCase() + name.slice(1)}</h4>
                          <pre className="p-3 rounded-lg bg-zinc-950 text-sky-400 font-mono text-xs overflow-auto">{code as string}</pre>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
