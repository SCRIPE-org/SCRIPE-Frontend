"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Check, Copy, Terminal } from "lucide-react";

/** Props for PatQuickStartSnippetsCard. */
export interface PatQuickStartSnippetsCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  tokenPrefix: string;
}

/**
 * Developer integration quick-start examples (cURL, TypeScript, .NET)
 * using safe token placeholders on the dedicated /account/integrations/[id] page.
 */
export function PatQuickStartSnippetsCard({ t, tokenPrefix }: PatQuickStartSnippetsCardProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const maskedTokenRef = `${tokenPrefix || "scr_pat_"}<SECRET>`;

  const snippets: Record<"curl" | "typescript" | "dotnet", string> = {
    curl: `curl -X GET "https://api.scripe.org/api/v1/account/dossier" \\\n  -H "Authorization: Bearer ${maskedTokenRef}" \\\n  -H "Accept: application/json"`,
    typescript: `import { createScripeClient } from "@scripe/sdk";\n\nconst client = createScripeClient({\n  baseUrl: "https://api.scripe.org",\n  token: process.env.SCRIPE_PAT,\n});\nconst dossier = await client.account.getDossier();`,
    dotnet: `using var client = new HttpClient();\nclient.DefaultRequestHeaders.Authorization =\n    new AuthenticationHeaderValue("Bearer", Environment.GetEnvironmentVariable("SCRIPE_PAT"));\nvar res = await client.GetAsync("https://api.scripe.org/api/v1/account/dossier");`,
  };

  const handleCopy = async (tab: "curl" | "typescript" | "dotnet") => {
    try {
      await navigator.clipboard.writeText(snippets[tab]);
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 1600);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
          <CardTitle className="text-base font-bold text-nx-ink">
            {t("profile.integrations.quickStartTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.integrations.quickStartDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList variant="pill" className="h-9 mb-3">
            <TabsTrigger value="curl" className="text-xs">
              cURL
            </TabsTrigger>
            <TabsTrigger value="typescript" className="text-xs">
              TypeScript
            </TabsTrigger>
            <TabsTrigger value="dotnet" className="text-xs">
              .NET 10
            </TabsTrigger>
          </TabsList>

          {(["curl", "typescript", "dotnet"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="rounded-xl border border-nx-line bg-nx-ground overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-b border-nx-line bg-nx-raised">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-3" dir="ltr">
                    {tab === "curl" ? "HTTP / cURL" : tab === "typescript" ? "@scripe/sdk" : ".NET 10 HttpClient"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleCopy(tab)}
                    className="h-7 px-2 text-[11px] gap-1"
                  >
                    {copiedTab === tab ? (
                      <>
                        <Check className="h-3 w-3 text-success" aria-hidden="true" />
                        <span>{t("profile.common.copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" aria-hidden="true" />
                        <span>{t("profile.common.copy")}</span>
                      </>
                    )}
                  </Button>
                </div>
                <pre
                  dir="ltr"
                  className="text-xs font-mono text-nx-ink-2 overflow-x-auto p-3.5 leading-relaxed text-left"
                >
                  <code>{snippets[tab]}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
