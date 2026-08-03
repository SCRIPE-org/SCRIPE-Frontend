/**
 * StaffMember Repository Implementation
 *
 * Implements IStaffMemberRepository using the StaffMemberService.
 * Uses StaffMemberMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
  IStaffMemberRepository,
  StaffMemberListParams,
} from "../../domain/interfaces/IStaffMemberRepository";
import type {
  IStaffMemberService,
  IdentityUserSearchResult,
} from "../../domain/interfaces/IStaffMemberService";
import type { StaffMember } from "../../domain/entities/StaffMember";
import { StaffMemberMapper } from "../mappers/StaffMemberMapper";

export class StaffMemberRepository implements IStaffMemberRepository {
  constructor(private readonly service: IStaffMemberService) {}

  async getAll(params: StaffMemberListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => StaffMemberMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<StaffMember> {
    const model = await this.service.getById(id);
    return StaffMemberMapper.toEntity(model);
  }

  async create(data: Record<string, unknown>): Promise<string> {
    const response = await this.service.create(data);
    return response.id;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.service.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async searchIdentityUsers(query: string): Promise<IdentityUserSearchResult[]> {
    return this.service.searchIdentityUsers(query);
  }
}
