/* eslint-disable unused-imports/no-unused-vars */
/**
 * Module Federation shared dependency manifest for Tier 1 plugins.
 *
 * Tier 1 plugins are trusted, in-process certified modules that use
 * Module Federation to share React, ReactDOM, and SCRIPE's design system
 * from the host bundle. This avoids duplicate React instances.
 *
 * To wire a Tier 1 plugin's remote into the host:
 *   1. Register its remoteEntry URL under `remotes` in next.config.ts
 *      (using @module-federation/nextjs-mf or similar)
 *   2. Add its pluginKey → remoteEntry mapping in PLUGIN_FEDERATION_REMOTES below
 *   3. The plugin exposes its root component as `./Plugin`
 *
 * Shared singletons the host provides to all Tier 1 plugins:
 */
export const FEDERATION_SHARED: Record<string, { singleton: boolean; requiredVersion: string }> = {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
  "react/jsx-runtime": { singleton: true, requiredVersion: "^19.0.0" },
};

/**
 * Runtime map of pluginKey → remoteEntry URL.
 * Populated dynamically from PluginDefinition.workspaceKey + BaseUrl at install time.
 * In production this comes from the plugin manifest rather than being hardcoded.
 */
export type PluginFederationRemote = {
  pluginKey: string;
  remoteEntryUrl: string;
  exposedModule: string;
};

export function buildRemoteEntryUrl(baseUrl: string, pluginKey: string): string {
  return `${baseUrl}/remoteEntry.js`;
}
