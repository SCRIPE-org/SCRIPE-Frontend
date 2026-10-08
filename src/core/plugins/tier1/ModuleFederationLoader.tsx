"use client";

import { Suspense, useState, useEffect, ComponentType } from "react";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { useI18n } from "@core/providers/i18n-provider";
import { buildRemoteEntryUrl } from "./federation-config";
import { appLogger } from "@/core/common/logger";

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
  const { t } = useI18n();
  const [PluginComponent, setPluginComponent] = useState<ComponentType<{
    installationId: string;
  }> | null>(null);
  // A flag, not a message: the sentence the user reads is built at render time
  // so it follows the active language, while the technical cause stays in the
  // log where it belongs.
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const remoteEntryUrl = buildRemoteEntryUrl(baseUrl, pluginKey);
    const remoteScope = scope ?? pluginKey.replace(/-/g, "_");

    loadFederatedModule(remoteEntryUrl, remoteScope, exposedModule)
      .then((Component) => setPluginComponent(() => Component))
      .catch((err) => {
        appLogger.error(`[PluginLoader] Failed to load Tier 1 plugin "${pluginKey}"`, err);
        setHasError(true);
      });
  }, [pluginKey, baseUrl, scope, exposedModule]);

  if (hasError) {
    return (
      <ErrorMessage size="sm" message={t("errors.plugin.loadFailed", { plugin: pluginKey })} />
    );
  }

  const placeholder = (
    <Skeleton
      className="h-64 w-full rounded-nx-lg"
      role="status"
      aria-label={t("common.loading")}
    />
  );

  if (!PluginComponent) {
    return placeholder;
  }

  return (
    <Suspense fallback={placeholder}>
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
  const container = (window as unknown as Record<string, unknown>)[scope] as
    FederationContainer | undefined;
  if (!container) throw new Error(`Remote container "${scope}" not found on window`);

  // G12 Fix: __webpack_share_scopes__ is a webpack-only global.
  // Under Turbopack (Next.js --turbo), this global does not exist.
  // We use an empty shared scope as a safe fallback — the plugin's own
  // internal dependencies will still resolve via its own bundled scope.

  const shareScope =
    typeof __webpack_share_scopes__ !== "undefined" ? __webpack_share_scopes__.default : {};
  await container.init(shareScope);
  const factory = await container.get(module);
  const mod = factory() as { default: ComponentType<{ installationId: string }> };
  return mod.default;
}

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      resolve();
      return;
    }
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
