/**
 * WorkManagement Module DI Container
 */
import { getModuleApiService } from "@/core/services/api-factory";

import { WorkItemService } from "./work-item/src/data/services/WorkItemService";
import { WorkItemRepository } from "./work-item/src/data/repositories/WorkItemRepository";
import type { IWorkItemService } from "./work-item/src/domain/interfaces/IWorkItemService";
import type { IWorkItemRepository } from "./work-item/src/domain/interfaces/IWorkItemRepository";

export interface WorkManagementContainer {
  workItemService: IWorkItemService;
  workItemRepository: IWorkItemRepository;
}

let _container: WorkManagementContainer | null = null;

export function getWorkManagementContainer(): WorkManagementContainer {
  if (!_container) {
    const apiService = getModuleApiService("WorkManagement");
    const workItemService = new WorkItemService(apiService);
    _container = {
      workItemService,
      workItemRepository: new WorkItemRepository(workItemService),
    };
  }
  return _container;
}

export const workManagementContainer = {
  get workItemRepository() {
    return getWorkManagementContainer().workItemRepository;
  },
};
