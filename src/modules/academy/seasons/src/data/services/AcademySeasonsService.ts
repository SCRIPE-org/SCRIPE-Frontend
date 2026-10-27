import type { IApiService } from "@core/interfaces/api.interface";
import type { IAcademySeasonsService } from "../../domain/interfaces/IAcademySeasonsService";
import type { AcademySeason, CreateSeasonPayload } from "../../domain/entities/AcademySeason";
import { ACADEMY_SEASONS_ENDPOINTS } from "./academy-seasons.endpoints";

export class AcademySeasonsService implements IAcademySeasonsService {
  constructor(private readonly api: IApiService) {}

  async getSeasons(): Promise<AcademySeason[]> {
    const url = ACADEMY_SEASONS_ENDPOINTS.LIST();
    return await this.api.get<AcademySeason[]>(url);
  }

  async createSeason(payload: CreateSeasonPayload): Promise<AcademySeason> {
    const url = ACADEMY_SEASONS_ENDPOINTS.CREATE();
    return await this.api.post<AcademySeason>(url, payload);
  }
}
