/**
 * StaffMember Service
 *
 * Handles all API calls for StaffMember.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  StaffMemberModel,
  type StaffMemberJson,
  type StaffMemberListResponseJson,
} from "../models/StaffMemberModel";
import type {
  IStaffMemberService,
  StaffMemberListResult,
  IdentityUserSearchResult,
} from "../../domain/interfaces/IStaffMemberService";
import { STAFF_MEMBER_ENDPOINTS } from "./staff-member.endpoints";

/** Shape shared by the Admins and Users list DTOs — enough to build a display label. */
interface IdentityDirectoryEntryJson {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

/**
 * Documentation for module export
 */
export class StaffMemberService implements IStaffMemberService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<StaffMemberListResult> {
    const url = buildUrl(STAFF_MEMBER_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });

    const response = await this.api.get<StaffMemberListResponseJson>(url);

    return {
      items: response.items.map((json) => StaffMemberModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<StaffMemberModel> {
    const json = await this.api.get<StaffMemberJson>(STAFF_MEMBER_ENDPOINTS.BY_ID(id));
    return StaffMemberModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(STAFF_MEMBER_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(STAFF_MEMBER_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(STAFF_MEMBER_ENDPOINTS.DELETE(id));
  }

  /**
   * Search Identity Admins + Users by name/email for the Linked User Account
   * picker (F-86). identityUserId may resolve to either kind (see backend
   * CreateStaffMemberCommandHandler, which tries the Admin reader then the
   * User reader), so both endpoints are queried and the results merged.
   *
   * Either call can 403 for a caller without admins.view/users.view — that
   * branch degrades to an empty list rather than failing the whole search,
   * same as the existing user-subscriptions searchUsers precedent.
   */
  async searchIdentityUsers(query: string): Promise<IdentityUserSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const toDisplayName = (entry: IdentityDirectoryEntryJson): string => {
      const name = `${entry.firstName ?? ""} ${entry.lastName ?? ""}`.trim();
      return name || entry.username;
    };

    const [adminsResult, usersResult] = await Promise.allSettled([
      this.api.get<{ items: IdentityDirectoryEntryJson[] }>(
        buildUrl(STAFF_MEMBER_ENDPOINTS.ADMINS_SEARCH, { search: query, page: 1, pageSize: 10 })
      ),
      this.api.get<{ items: IdentityDirectoryEntryJson[] }>(
        buildUrl(STAFF_MEMBER_ENDPOINTS.USERS_SEARCH, { search: query, page: 1, pageSize: 10 })
      ),
    ]);

    const admins: IdentityUserSearchResult[] =
      adminsResult.status === "fulfilled"
        ? (adminsResult.value.items ?? []).map((a) => ({
            id: a.id,
            name: toDisplayName(a),
            email: a.email ?? "",
            kind: "admin" as const,
          }))
        : [];

    const users: IdentityUserSearchResult[] =
      usersResult.status === "fulfilled"
        ? (usersResult.value.items ?? []).map((u) => ({
            id: u.id,
            name: toDisplayName(u),
            email: u.email ?? "",
            kind: "user" as const,
          }))
        : [];

    return [...admins, ...users];
  }
}
