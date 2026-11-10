import type { IApiService } from "@core/interfaces/api.interface";
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
import { ACADEMY_ATHLETES_ENDPOINTS } from "./academy-athletes.endpoints";

export class AcademyAthletesService implements IAcademyAthletesService {
  constructor(private readonly api: IApiService) {}

  async getAthletes(branchId?: string, sportId?: string, search?: string): Promise<AcademyAthlete[]> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.LIST(branchId, sportId, search);
    return await this.api.get<AcademyAthlete[]>(url);
  }

  async getAthleteById(id: string): Promise<AcademyAthlete> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.GET_BY_ID(id);
    return await this.api.get<AcademyAthlete>(url);
  }

  async getAthleteQr(id: string): Promise<AthleteQr> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.GET_QR(id);
    return await this.api.get<AthleteQr>(url);
  }

  async getAthleteCard(cardToken: string): Promise<AthleteCard> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.GET_CARD(cardToken);
    return await this.api.get<AthleteCard>(url);
  }

  async searchGuardians(query?: string): Promise<GuardianSummary[]> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.GUARDIANS(query);
    return await this.api.get<GuardianSummary[]>(url);
  }

  async registerChild(payload: RegisterChildAthletePayload): Promise<AcademyAthlete> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.REGISTER_CHILD();
    return await this.api.post<AcademyAthlete>(url, payload);
  }

  async registerAdult(payload: RegisterAdultAthletePayload): Promise<AcademyAthlete> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.REGISTER_ADULT();
    return await this.api.post<AcademyAthlete>(url, payload);
  }

  async linkSibling(payload: LinkSiblingAthletePayload): Promise<AcademyAthlete> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.LINK_SIBLING();
    return await this.api.post<AcademyAthlete>(url, payload);
  }

  async addSportParticipation(athleteId: string, payload: AddSportParticipationPayload): Promise<AthleteSportParticipation> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.ADD_PARTICIPATION(athleteId);
    return await this.api.post<AthleteSportParticipation>(url, payload);
  }

  async getSports(): Promise<AthleteSportTaxonomyItem[]> {
    const url = ACADEMY_ATHLETES_ENDPOINTS.SPORTS();
    return await this.api.get<AthleteSportTaxonomyItem[]>(url);
  }
}
