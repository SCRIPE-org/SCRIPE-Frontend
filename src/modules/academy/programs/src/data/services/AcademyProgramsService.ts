import type { IApiService } from "@core/interfaces/api.interface";
import type { IAcademyProgramsService } from "../../domain/interfaces/IAcademyProgramsService";
import type { AcademyProgram, CreateProgramPayload, SportTaxonomyItem } from "../../domain/entities/AcademyProgram";
import { ACADEMY_PROGRAMS_ENDPOINTS } from "./academy-programs.endpoints";

export class AcademyProgramsService implements IAcademyProgramsService {
  constructor(private readonly api: IApiService) {}

  async getPrograms(sportId?: string, isPublishedOnly?: boolean): Promise<AcademyProgram[]> {
    const url = ACADEMY_PROGRAMS_ENDPOINTS.LIST(sportId, isPublishedOnly);
    return await this.api.get<AcademyProgram[]>(url);
  }

  async getProgramById(id: string): Promise<AcademyProgram> {
    const url = ACADEMY_PROGRAMS_ENDPOINTS.GET_BY_ID(id);
    return await this.api.get<AcademyProgram>(url);
  }

  async createProgram(payload: CreateProgramPayload): Promise<AcademyProgram> {
    const url = ACADEMY_PROGRAMS_ENDPOINTS.CREATE();
    return await this.api.post<AcademyProgram>(url, payload);
  }

  async publishProgram(id: string): Promise<AcademyProgram> {
    const url = ACADEMY_PROGRAMS_ENDPOINTS.PUBLISH(id);
    return await this.api.post<AcademyProgram>(url, {});
  }

  async getSports(): Promise<SportTaxonomyItem[]> {
    const url = ACADEMY_PROGRAMS_ENDPOINTS.SPORTS();
    return await this.api.get<SportTaxonomyItem[]>(url);
  }
}
