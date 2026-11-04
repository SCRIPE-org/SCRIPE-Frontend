import type { AcademySeason, CreateSeasonPayload } from "../entities/AcademySeason";

export interface IAcademySeasonsRepository {
  fetchSeasons(): Promise<AcademySeason[]>;
  createSeason(payload: CreateSeasonPayload): Promise<AcademySeason>;
}
