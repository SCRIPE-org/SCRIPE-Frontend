import type { IAcademyAthletesRepository } from "../../domain/interfaces/IAcademyAthletesRepository";
import type { IAcademyAthletesService } from "../../domain/interfaces/IAcademyAthletesService";
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
} from "../../domain/entities/AcademyAthlete";

export class AcademyAthletesRepository implements IAcademyAthletesRepository {
  constructor(private readonly service: IAcademyAthletesService) {}

  async getAthletes(branchId?: string, sportId?: string, search?: string): Promise<AcademyAthlete[]> {
    return await this.service.getAthletes(branchId, sportId, search);
  }

  async getAthleteById(id: string): Promise<AcademyAthlete> {
    return await this.service.getAthleteById(id);
  }

  async getAthleteQr(athleteId: string): Promise<AthleteQr> {
    return await this.service.getAthleteQr(athleteId);
  }

  async getAthleteCard(cardToken: string): Promise<AthleteCard> {
    return await this.service.getAthleteCard(cardToken);
  }

  async searchGuardians(query?: string): Promise<GuardianSummary[]> {
    return await this.service.searchGuardians(query);
  }

  async registerChild(payload: RegisterChildAthletePayload): Promise<AcademyAthlete> {
    return await this.service.registerChild(payload);
  }

  async registerAdult(payload: RegisterAdultAthletePayload): Promise<AcademyAthlete> {
    return await this.service.registerAdult(payload);
  }

  async linkSibling(payload: LinkSiblingAthletePayload): Promise<AcademyAthlete> {
    return await this.service.linkSibling(payload);
  }

  async addSportParticipation(athleteId: string, payload: AddSportParticipationPayload): Promise<AthleteSportParticipation> {
    return await this.service.addSportParticipation(athleteId, payload);
  }

  async getSports(): Promise<AthleteSportTaxonomyItem[]> {
    return await this.service.getSports();
  }
}
