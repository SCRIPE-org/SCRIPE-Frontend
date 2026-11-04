import type {
  AcademyAthlete,
  GuardianSummary,
  RegisterChildAthletePayload,
  RegisterAdultAthletePayload,
  LinkSiblingAthletePayload,
  AddSportParticipationPayload,
  AthleteSportParticipation,
  AthleteSportTaxonomyItem
} from "../entities/AcademyAthlete";

export interface IAcademyAthletesRepository {
  getAthletes(branchId?: string, sportId?: string, search?: string): Promise<AcademyAthlete[]>;
  getAthleteById(id: string): Promise<AcademyAthlete>;
  searchGuardians(query?: string): Promise<GuardianSummary[]>;
  registerChild(payload: RegisterChildAthletePayload): Promise<AcademyAthlete>;
  registerAdult(payload: RegisterAdultAthletePayload): Promise<AcademyAthlete>;
  linkSibling(payload: LinkSiblingAthletePayload): Promise<AcademyAthlete>;
  addSportParticipation(athleteId: string, payload: AddSportParticipationPayload): Promise<AthleteSportParticipation>;
  getSports(): Promise<AthleteSportTaxonomyItem[]>;
}
