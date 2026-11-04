import type { AcademySeason, CreateSeasonPayload } from "../entities/AcademySeason";

export interface IAcademySeasonsService {
  getSeasons(): Promise<AcademySeason[]>;
  createSeason(payload: CreateSeasonPayload): Promise<AcademySeason>;
}
