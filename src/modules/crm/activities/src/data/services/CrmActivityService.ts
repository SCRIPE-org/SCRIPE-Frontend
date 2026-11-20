import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmActivityService } from "../../domain/interfaces/ICrmActivityService";
import type {
  CrmActivity,
  CrmActivitiesQueryFilter,
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
  FollowUpCreatedResponse,
  PagedActivitiesResult,
} from "../../domain/models/CrmActivity";
import { CRM_ACTIVITY_ENDPOINTS } from "./crm-activity.endpoints";

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

/** HTTP API client service for CRM Sales Activities and follow-up work items. */
export class CrmActivityService implements ICrmActivityService {
  constructor(private readonly api: IApiService) {}

  /** Fetches paginated CRM sales activities matching entity and kind filters. */
  async getActivities(filter: CrmActivitiesQueryFilter): Promise<PagedActivitiesResult> {
    const queryParams: Record<string, unknown> = {
      page: filter.page ?? 1,
      pageSize: filter.pageSize ?? 20,
    };

    if (filter.leadId) queryParams.leadId = filter.leadId;
    if (filter.accountId) queryParams.accountId = filter.accountId;
    if (filter.opportunityId) queryParams.opportunityId = filter.opportunityId;
    if (filter.activityKind) queryParams.activityKind = filter.activityKind;
    if (filter.includeAllVisible) queryParams.includeAllVisible = filter.includeAllVisible;

    const response = await this.api.get<
      ApiSuccessResponse<PagedActivitiesResult> | PagedActivitiesResult
    >(CRM_ACTIVITY_ENDPOINTS.ACTIVITIES, queryParams);

    if (response && typeof response === "object" && "data" in response && (response as ApiSuccessResponse<PagedActivitiesResult>).data) {
      return (response as ApiSuccessResponse<PagedActivitiesResult>).data;
    }
    return response as PagedActivitiesResult;
  }

  /** Sanitizes and persists a manual CRM sales activity entry via POST. */
  async createActivity(payload: CreateSalesActivityPayload): Promise<CrmActivity> {
    const sanitized: CreateSalesActivityPayload = {
      ...payload,
      summary: stripHtmlTags(payload.summary).trim(),
      bodyText: payload.bodyText ? stripHtmlTags(payload.bodyText).trim() : payload.bodyText,
    };
    const response = await this.api.post<
      ApiSuccessResponse<CrmActivity> | CrmActivity
    >(CRM_ACTIVITY_ENDPOINTS.ACTIVITIES, sanitized);

    if (response && typeof response === "object" && "data" in response && (response as ApiSuccessResponse<CrmActivity>).data) {
      return (response as ApiSuccessResponse<CrmActivity>).data;
    }
    return response as CrmActivity;
  }

  /** Creates a linked follow-up work item for the specified sales activity. */
  async createFollowUp(
    activityId: string,
    payload: CreateActivityFollowUpPayload
  ): Promise<FollowUpCreatedResponse> {
    const response = await this.api.post<
      ApiSuccessResponse<FollowUpCreatedResponse> | FollowUpCreatedResponse
    >(CRM_ACTIVITY_ENDPOINTS.FOLLOW_UP(activityId), payload);

    if (response && typeof response === "object" && "data" in response && (response as ApiSuccessResponse<FollowUpCreatedResponse>).data) {
      return (response as ApiSuccessResponse<FollowUpCreatedResponse>).data;
    }
    return response as FollowUpCreatedResponse;
  }

  /** Marks an existing follow-up work item as completed by preserving its metadata. */
  async completeFollowUpWorkItem(workItemId: string): Promise<void> {
    interface WorkItemSnapshot {
      title?: string;
      description?: string | null;
      priority?: number;
      dueAt?: string | null;
      assignedToId?: string | null;
      isActive?: boolean;
    }
    const response = await this.api.get<ApiSuccessResponse<WorkItemSnapshot> | WorkItemSnapshot>(
      CRM_ACTIVITY_ENDPOINTS.WORK_ITEM_BY_ID(workItemId)
    );
    const existing: WorkItemSnapshot =
      response && typeof response === "object" && "data" in response && response.data
        ? response.data
        : (response as WorkItemSnapshot);

    await this.api.put(CRM_ACTIVITY_ENDPOINTS.WORK_ITEM_BY_ID(workItemId), {
      title: existing?.title || "Follow-Up Task",
      description: existing?.description ?? null,
      status: 3,
      priority: existing?.priority ?? 1,
      dueAt: existing?.dueAt ?? null,
      assignedToId: existing?.assignedToId ?? null,
      isActive: existing?.isActive ?? true,
    });
  }
}
