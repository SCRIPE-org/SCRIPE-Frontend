"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { ecosystemContainer } from "@modules/ecosystem/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "sonner";
import type { GraphQLResponse } from "../../domain/entities/GraphQLResponse";

const DEFAULT_QUERY = `# GraphQL Explorer — NEXORA Platform
# Write queries against the platform schema

query GetPlugins {
  plugins {
    id
    name
    version
    status
    author
  }
}`;

export interface QueryHistoryItem {
  query: string;
  timestamp: Date;
  duration: number;
  hasErrors: boolean;
}

export function useGraphQLExplorerViewModel() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [variables, setVariables] = useState("{}");
  const [result, setResult] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [schemaTypes, setSchemaTypes] = useState<any[]>([]);
  const [copiedResult, setCopiedResult] = useState(false);

  const { t } = useI18n();
  const { graphqlRepository } = ecosystemContainer;

  // Execute query mutation
  const executeMutation = useMutation({
    mutationFn: async () => {
      let vars: Record<string, unknown> = {};
      try {
        vars = JSON.parse(variables || "{}");
      } catch {
        // ignore malformed vars
      }
      return graphqlRepository.executeQuery(query, vars);
    },
    onSuccess: (response: GraphQLResponse) => {
      setResult(response.toJSON());
      setActiveTab("result");
      // Add to history
      setHistory(prev => [{
        query,
        timestamp: new Date(),
        duration: 0,
        hasErrors: response.hasErrors,
      }, ...prev.slice(0, 19)]);
      if (response.hasErrors) {
        toast.warning(t("graphql.queryHasErrors") || "Query returned errors");
      }
    },
    onError: (err: any) => {
      setResult(JSON.stringify({ error: err?.message || "Request failed" }, null, 2));
      toast.error(t("graphql.executionFailed") || "Query execution failed");
    },
  });

  // Introspect mutation
  const introspectMutation = useMutation({
    mutationFn: () => graphqlRepository.introspect(),
    onSuccess: (response: GraphQLResponse) => {
      const data = response.data as any;
      const types = data?.__schema?.types ?? [];
      setSchemaTypes(types.filter((t: any) => !t.name.startsWith("__")));
      toast.success(t("graphql.schemaLoaded") || "Schema loaded");
    },
    onError: () => {
      toast.error(t("graphql.schemaFailed") || "Failed to load schema");
    },
  });

  // Load schema on mount
  useEffect(() => {
    introspectMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExecute = useCallback(() => {
    executeMutation.mutate();
  }, [executeMutation]);

  const handleCopyResult = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  }, [result]);

  const handleLoadHistoryItem = useCallback((item: QueryHistoryItem) => {
    setQuery(item.query);
    setActiveTab("editor");
  }, []);

  return {
    query, setQuery,
    variables, setVariables,
    result,
    activeTab, setActiveTab,
    history,
    schemaTypes,
    copiedResult,
    handleExecute,
    handleCopyResult,
    handleLoadHistoryItem,
    isExecuting: executeMutation.isPending,
    isLoadingSchema: introspectMutation.isPending,
  };
}
