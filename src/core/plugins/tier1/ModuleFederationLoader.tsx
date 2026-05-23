"use client";

import { Suspense, lazy, useState, useEffect, ComponentType } from "react";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { buildRemoteEntryUrl } from "./federation-config";

interface ModuleFederationLoaderProps {
  pluginKey: string;
  baseUrl: string;
  installationId: string;
  scope?: string;
  module?: string;
}

/**
 * Dynamically loads a Tier 1 plugin's federated module at runtime.
 * The plugin must expose a default export React component via Module Federation.
 *
 * The host's next.config.ts must register the plugin's remote entry URL.
 * This component handles the async import + error boundary pattern.
 */
export function ModuleFederationLoader({
  pluginKey,
  baseUrl,
  installationId,
  scope,
  module: exposedModule = "./Plugin",
}: ModuleFederationLoaderProps) {
  const [PluginComponent, setPluginComponent] = useState<ComponentType<{ installationId: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const remoteEntryUrl = buildRemoteEntryUrl(baseUrl, pluginKey);
    const remoteScope = scope ?? pluginKey.replace(/-/g, "_");

    loadFederatedModule(remoteEntryUrl, remoteScope, exposedModule)
      .then((Component) => setPluginComponent(() => Component))
      .catch((err) => {
        console.error(`[PluginLoader] Failed to load Tier 1 plugin "${pluginKey}"`, err);
        setError(`Failed to load plugin "${pluginKey}"`);
      });
  }, [pluginKey, baseUrl, scope, exposedModule]);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-6">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!PluginComponent) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <PluginComponent installationId={installationId} />
    </Suspense>
  );
}

async function loadFederatedModule(
  remoteEntryUrl: string,
  scope: string,
  module: string
): Promise<ComponentType<{ installationId: string }>> {
  // Load the remote entry script into the browser
  await loadScript(remoteEntryUrl);

  // Access the module federation container on window
  const container = (window as unknown as Record<string, unknown>)[scope] as FederationContainer | undefined;
  if (!container) throw new Error(`Remote container "${scope}" not found on window`);

  // G12 Fix: __webpack_share_scopes__ is a webpack-only global.
  // Under Turbopack (Next.js --turbo), this global does not exist.
  // We use an empty shared scope as a safe fallback — the plugin's own
  // internal dependencies will still resolve via its own bundled scope.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shareScope = typeof __webpack_share_scopes__ !== "undefined"
    ? __webpack_share_scopes__.default
    : {};
  await container.init(shareScope);
  const factory = await container.get(module);
  const mod = factory() as { default: ComponentType<{ installationId: string }> };
  return mod.default;

}

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

interface FederationContainer {
  init(scope: unknown): Promise<void>;
  get(module: string): Promise<() => unknown>;
}

declare const __webpack_share_scopes__: { default: unknown } | undefined;
