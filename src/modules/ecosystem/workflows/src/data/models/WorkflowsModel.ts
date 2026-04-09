export interface WorkflowsModel {
  id: string;
  definitionKey: string;
  status: string;
  currentStep: string;
  startedAt: string;
  completedAt: string;
  initiator: string;
}

export interface WorkflowsListModel {
  id: string;
  definitionKey: string;
  status: string;
  currentStep: string;
  startedAt: string;
  initiator: string;
}
