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
    <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-semibold">
            {t("apikeys.quickstart.title") || "Developer Quick Start & API Integration"}
          </CardTitle>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("apikeys.quickstart.desc") ||
            "Get started by making your first API call. Copy the code snippets below to configure your client integrations."}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="mb-4 grid max-w-[400px] grid-cols-3 bg-muted/30">
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
              <pre className="select-all overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                <code>{curlCode}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2.5 top-2.5 h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleCopy(curlCode, "curl")}
              >
                {copiedTab === "curl" ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-sans text-[10px] text-muted-foreground">
              <Code2 className="h-3.5 w-3.5 shrink-0" />
              <span>
                Replace the placeholder with the plaintext token generated during creation.
              </span>
            </p>
          </TabsContent>

          {/* Node.js Content */}
          <TabsContent value="node" className="space-y-3 outline-none">
            <div className="relative">
              <pre className="select-all overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                <code>{nodeCode}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2.5 top-2.5 h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
              <pre className="select-all overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                <code>{dotnetCode}</code>
              </pre>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2.5 top-2.5 h-7 w-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
