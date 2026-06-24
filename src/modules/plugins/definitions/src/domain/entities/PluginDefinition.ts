/**
 * Domain entity class representing a Plugin Definition.
 */
export class PluginDefinition {
  constructor(public readonly id: string) {}

  copyWith(updates: { id?: string }): PluginDefinition {
    return new PluginDefinition(updates.id ?? this.id);
  }
}
