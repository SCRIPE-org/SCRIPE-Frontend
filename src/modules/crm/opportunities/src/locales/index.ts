import { workflowStudioEn, type WorkflowStudioLocaleKey } from "./workflowStudio.en";
import { workflowStudioAr } from "./workflowStudio.ar";

export { workflowStudioEn, workflowStudioAr, type WorkflowStudioLocaleKey };

export function getWorkflowStudioText(key: WorkflowStudioLocaleKey, isAr: boolean): string {
  return isAr ? workflowStudioAr[key] : workflowStudioEn[key];
}
