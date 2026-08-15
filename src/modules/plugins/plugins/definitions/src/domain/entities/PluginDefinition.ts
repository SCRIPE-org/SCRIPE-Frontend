/**
 * Domain model representing a Plugin Definition structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class PluginDefinition {
  constructor(public readonly id: string) {}

  copyWith(updates: { id?: string }): PluginDefinition {
    return new PluginDefinition(updates.id ?? this.id);
  }
}
