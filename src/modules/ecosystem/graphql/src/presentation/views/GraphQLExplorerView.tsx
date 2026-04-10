"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Textarea } from "@core/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Skeleton } from "@core/ui/skeleton";
import {
  Play, Code2, BookOpen, History, Braces, FileJson,
  Loader2, Copy, Check, Zap, GitBranch, RefreshCw,
} from "lucide-react";
import { useGraphQLExplorerViewModel } from "../viewmodels/useGraphQLExplorerViewModel";

const INTROSPECTION_QUERY = `{
  __schema {
    types {
      name
      kind
      fields {
        name
      }
    }
  }
}`;

export function GraphQLExplorerView() {
  useModuleLocales(() => import("../../../locales"), "graphql");
  const { t } = useI18n();
  const vm = useGraphQLExplorerViewModel();
  const [activeSchemaType, setActiveSchemaType] = useState<string | null>(null);

  const handleLoadIntrospection = useCallback(() => {
    vm.setQuery(INTROSPECTION_QUERY);
  }, [vm]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
            <Zap className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("graphql.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("graphql.description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 font-mono text-xs">
            <Zap className="h-3 w-3" />
            {t("graphql.endpoint")}: /graphql
          </Badge>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="grid grid-cols-12 gap-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        {/* Schema Browser (left sidebar) */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t("graphql.schemaBrowser")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-3 pt-0">
              {vm.isLoadingSchema ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full rounded" />
                  ))}
                </div>
              ) : vm.schemaTypes.length === 0 ? (
                <div className="text-xs text-amber-500 space-y-2">
                  <p>{t("graphql.schemaFailed") || "Schema not loaded. Click Introspect to load."}</p>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleLoadIntrospection}>
                    <RefreshCw className="h-3 w-3" /> {t("graphql.retry") || "Retry"}
                  </Button>
                </div>
              ) : (
                <>
                  {vm.schemaTypes.map((type: any) => (
                    <div key={type.name}>
                      <button
                        onClick={() => setActiveSchemaType(activeSchemaType === type.name ? null : type.name)}
                        className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-start hover:bg-accent transition-colors ${
                          activeSchemaType === type.name ? "bg-accent font-medium" : ""
                        }`}
                      >
                        <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className={type.kind === "OBJECT" && (type.name === "NexoraQuery" || type.name === "NexoraMutation") ? "text-pink-500 font-semibold" : "text-blue-500"}>
                          {type.name}
                        </span>
                        <Badge variant="outline" className="ml-auto text-[10px] px-1">{type.kind}</Badge>
                      </button>
                      {activeSchemaType === type.name && type.fields && (
                        <div className="ml-6 space-y-0.5 py-1 border-l border-border pl-3">
                          {type.fields.map((field: any) => (
                            <div key={field.name} className="text-xs text-muted-foreground py-0.5 font-mono hover:text-foreground cursor-pointer">{field.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor + Response (main area) */}
        <div className="col-span-9 space-y-4">
          {/* Query Editor + Variables */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  {t("graphql.queryEditor")}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={handleLoadIntrospection}>
                  <BookOpen className="h-3 w-3" /> Introspect
                </Button>
              </div>
              <Button
                onClick={vm.handleExecute}
                disabled={vm.isExecuting}
                size="sm"
                className="gap-2 bg-pink-600 hover:bg-pink-700 text-white"
              >
                {vm.isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {vm.isExecuting ? t("graphql.executing") : t("graphql.execute")}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="query">
                <div className="border-b px-4">
                  <TabsList className="bg-transparent h-9">
                    <TabsTrigger value="query" className="text-xs gap-1.5 data-[state=active]:bg-muted">
                      <Braces className="h-3 w-3" />
                      {t("graphql.queryEditor")}
                    </TabsTrigger>
                    <TabsTrigger value="variables" className="text-xs gap-1.5 data-[state=active]:bg-muted">
                      <FileJson className="h-3 w-3" />
                      {t("graphql.variables")}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs gap-1.5 data-[state=active]:bg-muted">
                      <History className="h-3 w-3" />
                      {t("graphql.history")} {vm.history.length > 0 && <Badge variant="secondary" className="text-[10px] px-1 h-4">{vm.history.length}</Badge>}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="query" className="m-0">
                  <Textarea
                    value={vm.query}
                    onChange={(e) => vm.setQuery(e.target.value)}
                    className="min-h-[200px] rounded-none border-0 font-mono text-sm resize-none focus-visible:ring-0 bg-zinc-950 text-emerald-400 dark:bg-zinc-950"
                    placeholder={t("graphql.placeholder")}
                  />
                </TabsContent>
                <TabsContent value="variables" className="m-0">
                  <Textarea
                    value={vm.variables}
                    onChange={(e) => vm.setVariables(e.target.value)}
                    className="min-h-[200px] rounded-none border-0 font-mono text-sm resize-none focus-visible:ring-0 bg-zinc-950 text-amber-400 dark:bg-zinc-950"
                    placeholder={t("graphql.variablesPlaceholder")}
                  />
                </TabsContent>
                <TabsContent value="history" className="m-0 p-4">
                  {vm.history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("graphql.noHistory")}</p>
                  ) : (
                    <div className="space-y-2">
                      {vm.history.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => vm.handleLoadHistoryItem(h)}
                          className="w-full flex items-center justify-between rounded-md border p-2 text-xs hover:bg-accent transition-colors text-start"
                        >
                          <span className="font-mono text-muted-foreground truncate">{h.query.slice(0, 60)}</span>
                          <span className="text-muted-foreground shrink-0 ml-2">{h.timestamp.toLocaleTimeString()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                {t("graphql.response")}
              </CardTitle>
              {vm.result && (
                <Button variant="ghost" size="sm" onClick={vm.handleCopyResult} className="gap-1.5 text-xs">
                  {vm.copiedResult ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {vm.copiedResult ? "Copied!" : "Copy"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {vm.result ? (
                <pre className="p-4 font-mono text-sm overflow-auto max-h-[300px] bg-zinc-950 text-sky-400 dark:bg-zinc-950 rounded-b-lg">
                  {vm.result}
                </pre>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  {t("graphql.noResponse")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
