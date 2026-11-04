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

export class CrmActivityService implements ICrmActivityService {
  constructor(private readonly api: IApiService) {}

  async getActivities(filter: CrmActivitiesQueryFilter): Promise<PagedActivitiesResult> {
    const queryParams: Record<string, unknown> = {
      page: filter.page ?? 1,
      pageSize: filter.pageSize ?? 20,
    };

    if (filter.leadId) queryParams.leadId = filter.leadId;
    if (filter.accountId) queryParams.accountId = filter.accountId;
    if (filter.opportunityId) queryParams.opportunityId = filter.opportunityId;
    if (filter.activityKind) queryParams.activityKind = filter.activityKind;

    const response = await this.api.get<
      ApiSuccessResponse<PagedActivitiesResult> | PagedActivitiesResult
    >(CRM_ACTIVITY_ENDPOINTS.ACTIVITIES, queryParams);

    if (response && typeof response === "object" && "data" in response && (response as ApiSuccessResponse<PagedActivitiesResult>).data) {
      return (response as ApiSuccessResponse<PagedActivitiesResult>).data;
    }
    return response as PagedActivitiesResult;
  }

  async createActivity(payload: CreateSalesActivityPayload): Promise<CrmActivity> {
    const response = await this.api.post<
      ApiSuccessResponse<CrmActivity> | CrmActivity
    >(CRM_ACTIVITY_ENDPOINTS.ACTIVITIES, payload);

    if (response && typeof response === "object" && "data" in response && (response as ApiSuccessResponse<CrmActivity>).data) {
      return (response as ApiSuccessResponse<CrmActivity>).data;
    }
    return response as CrmActivity;
  }

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
}
