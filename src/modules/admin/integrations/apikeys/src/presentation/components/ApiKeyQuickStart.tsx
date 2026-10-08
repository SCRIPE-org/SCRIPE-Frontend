/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import { Copy, Check, Terminal, Code2 } from "lucide-react";
import type { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";

interface ApiKeyQuickStartProps {
  detail: ApiKeyDetail;
}

/**
 * Documentation for module export
 */
export function ApiKeyQuickStart({ detail }: ApiKeyQuickStartProps) {
  const { t } = useI18n();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const curlCode = `curl -X GET "https://api.scripe.org/api/v1/overview" \\
  -H "Authorization: Bearer sc_live_************************" \\
  -H "Content-Type: application/json"`;

  const nodeCode = `import { ScripeClient } from '@scripe/node';

const scripe = new ScripeClient({
  apiKey: 'sc_live_************************'
});

const overview = await scripe.overview.get();
console.log(overview);`;

  const dotnetCode = `using Scripe.Sdk;

var client = new ScripeClient("sc_live_************************");
var overview = await client.Overview.GetAsync();
Console.WriteLine(overview.Status);`;

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <Card className="border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-gradient-to-br from-[color:color-mix(in_srgb,var(--nx-accent)_5%,transparent)] via-transparent to-transparent">
      <CardHeader className="border-b border-nx-line pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-nx-accent" />
          <CardTitle className="text-sm font-semibold">{t("apikeys.quickstart.title")}</CardTitle>
        </div>
        <p className="mt-1 text-xs text-nx-ink-2">{t("apikeys.quickstart.desc")}</p>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="mb-4 grid max-w-[400px] grid-cols-3 bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)]">
            <TabsTrigger value="curl" className="text-xs font-medium">
              cURL
            </TabsTrigger>
            <TabsTrigger value="node" className="text-xs font-medium">
              Node.js
            </TabsTrigger>
            <TabsTrigger value="dotnet" className="text-xs font-medium">
              .NET (C#)
            </TabsTrigger>
          </TabsList>

          {/* cURL Content */}
          <TabsContent value="curl" className="space-y-3 outline-none">
            <div className="relative">
              <pre className="select-all overflow-x-auto rounded-nx-md border border-nx-line bg-nx-raised p-4 font-mono text-xs leading-relaxed text-nx-ink">
                <code>{curlCode}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute end-2.5 top-2.5 h-7 w-7 text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
                onClick={() => handleCopy(curlCode, "curl")}
              >
                {copiedTab === "curl" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-sans text-[10px] text-nx-ink-3">
              <Code2 className="h-3.5 w-3.5 shrink-0" />
              <span>
                Replace the placeholder with the plaintext token generated during creation.
              </span>
            </p>
          </TabsContent>

          {/* Node.js Content */}
          <TabsContent value="node" className="space-y-3 outline-none">
            <div className="relative">
              <pre className="select-all overflow-x-auto rounded-nx-md border border-nx-line bg-nx-raised p-4 font-mono text-xs leading-relaxed text-nx-ink">
                <code>{nodeCode}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute end-2.5 top-2.5 h-7 w-7 text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
                onClick={() => handleCopy(nodeCode, "node")}
              >
                {copiedTab === "node" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </TabsContent>

          {/* .NET Content */}
          <TabsContent value="dotnet" className="space-y-3 outline-none">
            <div className="relative">
              <pre className="select-all overflow-x-auto rounded-nx-md border border-nx-line bg-nx-raised p-4 font-mono text-xs leading-relaxed text-nx-ink">
                <code>{dotnetCode}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute end-2.5 top-2.5 h-7 w-7 text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
                onClick={() => handleCopy(dotnetCode, "dotnet")}
              >
                {copiedTab === "dotnet" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
