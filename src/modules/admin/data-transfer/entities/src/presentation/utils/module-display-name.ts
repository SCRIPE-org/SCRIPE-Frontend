/**
 * Translates a backend module identifier (e.g. "CRM", "Identity", "PartyKernel")
 * into its localized label using the Data Transfer Entities dictionary.
 */
export function resolveModuleDisplayName(
  owningModule: string,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (!owningModule) return "";
  return t(`dataTransferEntities.modules.${owningModule}`, {
    defaultValue: owningModule,
  });
}
