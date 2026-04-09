export interface WorkflowsEntityData {
  id: string;
  definitionKey: string;
  status: string;
  currentStep: string;
  startedAt: string;
  completedAt: string;
  initiator: string;
}

export class WorkflowsEntity {
  constructor(private readonly data: WorkflowsEntityData) {}

  get id() { return this.data.id; }
  get definitionKey() { return this.data.definitionKey; }
  get status() { return this.data.status; }
  get currentStep() { return this.data.currentStep; }
  get startedAt() { return this.data.startedAt; }
  get completedAt() { return this.data.completedAt; }
  get initiator() { return this.data.initiator; }

  copyWith(updates: Partial<WorkflowsEntityData>): WorkflowsEntity {
    return new WorkflowsEntity({ ...this.data, ...updates });
  }
}
