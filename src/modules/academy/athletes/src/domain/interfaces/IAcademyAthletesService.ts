import type {
  AcademyAthlete,
  AthleteCard,
  AthleteQr,
  GuardianSummary,
  RegisterChildAthletePayload,
  RegisterAdultAthletePayload,
  LinkSiblingAthletePayload,
  AddSportParticipationPayload,
  AthleteSportParticipation,
  AthleteSportTaxonomyItem
} from "../entities/AcademyAthlete";

export interface IAcademyAthletesService {
  getAthletes(branchId?: string, sportId?: string, search?: string): Promise<AcademyAthlete[]>;
  getAthleteById(id: string): Promise<AcademyAthlete>;
  getAthleteQr(athleteId: string): Promise<AthleteQr>;
  getAthleteCard(cardToken: string): Promise<AthleteCard>;
  searchGuardians(query?: string): Promise<GuardianSummary[]>;
  registerChild(payload: RegisterChildAthletePayload): Promise<AcademyAthlete>;
  registerAdult(payload: RegisterAdultAthletePayload): Promise<AcademyAthlete>;
  linkSibling(payload: LinkSiblingAthletePayload): Promise<AcademyAthlete>;
  addSportParticipation(athleteId: string, payload: AddSportParticipationPayload): Promise<AthleteSportParticipation>;
  getSports(): Promise<AthleteSportTaxonomyItem[]>;
}
