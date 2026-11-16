import type { AcademySeason, CreateSeasonPayload, UpdateSeasonPayload } from "../entities/AcademySeason";

export interface IAcademySeasonsRepository {
  fetchSeasons(): Promise<AcademySeason[]>;
  createSeason(payload: CreateSeasonPayload): Promise<AcademySeason>;
  updateSeason(id: string, payload: UpdateSeasonPayload): Promise<AcademySeason>;
}
