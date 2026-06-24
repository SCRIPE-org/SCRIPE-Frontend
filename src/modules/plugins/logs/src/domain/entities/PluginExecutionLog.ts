import type { PluginExecutionLogModel } from "../../data/models/LogsModels";

/**
 * Domain entity class representing a Plugin Execution Log.
 */
export class PluginExecutionLog {
  constructor(private readonly data: PluginExecutionLogModel) {}

  get id() {
    return this.data.id;
  }
  get installationId() {
    return this.data.installationId;
  }
  get pluginKey() {
    return this.data.pluginKey;
  }
  get endpoint() {
    return this.data.endpoint;
  }
  get executedAt() {
    return new Date(this.data.executedAt);
  }
  get durationMs() {
    return this.data.durationMs;
  }
  get isSuccess() {
    return this.data.isSuccess;
  }
  get statusCode() {
    return this.data.statusCode ?? null;
  }
  get errorMessage() {
    return this.data.errorMessage ?? null;
  }

  toModel() {
    return this.data;
  }

  copyWith(updates: Partial<PluginExecutionLogModel>): PluginExecutionLog {
    return new PluginExecutionLog({
      ...this.data,
      ...updates,
    } as PluginExecutionLogModel);
  }
}
