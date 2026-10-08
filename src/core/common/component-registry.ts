/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

/**
 * Global component registry to decouple cross-module references.
 * Allows modules (like auth) to register components/hooks that other
 * modules (like customization/branding) can consume dynamically at runtime,
 * avoiding direct cross-module static import violations.
 */
interface ComponentRegistry {
  LoginBranding?: React.ComponentType<any>;
  SlotRenderer?: React.ComponentType<any>;
  useLoginBrandingTokens?: (params: any) => any;
  SignupShell?: React.ComponentType<any>;
  tenantRepository?: any;
  /** Customization service instance for managing display settings and custom branding CSS */
  customizationService?: any;
  /** Hook to trigger account impersonation flow */
  useImpersonation?: () => any;
  /** Hook returning available SSO providers and login URL generators */
  useSsoProviders?: () => any;
  /** Hook managing passkey registrations and deletions */
  usePasskeyManagementViewModel?: () => any;
  /** Service method to fetch and trigger download of a subscription billing receipt PDF */
  downloadReceipt?: (tenantId: string) => Promise<{ blob: Blob; filename: string }>;
}

export const globalComponentRegistry: ComponentRegistry = {};

/**
 * Registers a component or hook into the global registry.
 *
 * @param key The registry key
 * @param value The component or hook value
 */
export function registerComponent<K extends keyof ComponentRegistry>(
  key: K,
  value: ComponentRegistry[K]
): void {
  globalComponentRegistry[key] = value;
}

/**
 * Retrieves a component or hook from the global registry.
 *
 * @param key The registry key
 * @returns The registered component or hook, or undefined if not found
 */
export function getComponent<K extends keyof ComponentRegistry>(key: K): ComponentRegistry[K] {
  return globalComponentRegistry[key];
}
