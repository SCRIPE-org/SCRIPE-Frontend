import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyAthletesService } from "./AcademyAthletesService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { RegisterChildAthletePayload, RegisterAdultAthletePayload, LinkSiblingAthletePayload } from "../../domain/entities/AcademyAthlete";

describe("AcademyAthletesService", () => {
  let service: AcademyAthletesService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };
    service = new AcademyAthletesService(mockApi as unknown as IApiService);
  });

  it("fetches athletes with optional sport and branch filters", async () => {
    const mockAthletes = [
      { id: "a1", firstNameEn: "Leo", lastNameEn: "Messi", isMinor: true, status: "Active" },
    ];
    mockApi.get.mockResolvedValue(mockAthletes);

    const res = await service.getAthletes("branch-1", "sport-1", "messi");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes?branchId=branch-1&sportId=sport-1&search=messi")
    );
    expect(res).toEqual(mockAthletes);
  });

  it("registers child athlete via POST /child", async () => {
    const payload: RegisterChildAthletePayload = {
      firstNameEn: "Leo",
      lastNameEn: "Messi",
      firstNameAr: "ليو",
      lastNameAr: "ميسي",
      dateOfBirth: "2015-06-24",
      gender: "Male",
      guardianName: "Jorge Messi",
      guardianPhone: "+966500000001",
      guardianRelationship: "Father",
      medicalClearanceSigned: true,
      guardianConsentSigned: true,
      initialSportId: "7ef8a28e-9adf-4135-a27f-354720ba0bdc",
      initialSkillLevel: "Beginner"
    };

    const created = { id: "ath-new", ...payload, isMinor: true, status: "Active", participations: [] };
    mockApi.post.mockResolvedValue(created);

    const res = await service.registerChild(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes/child"),
      payload
    );
    expect(res.id).toBe("ath-new");
    expect(res.isMinor).toBe(true);
  });

  it("registers adult athlete via POST /adult", async () => {
    const payload: RegisterAdultAthletePayload = {
      firstNameEn: "Cristiano",
      lastNameEn: "Ronaldo",
      firstNameAr: "كريستيانو",
      lastNameAr: "رونالدو",
      dateOfBirth: "1995-02-05",
      gender: "Male",
      phoneNumber: "+966500000002",
      medicalClearanceSigned: true,
      initialSportId: "7ef8a28e-9adf-4135-a27f-354720ba0bdc",
      initialSkillLevel: "Elite"
    };

    const created = { id: "ath-adult", ...payload, isMinor: false, guardianPartyId: null, status: "Active", participations: [] };
    mockApi.post.mockResolvedValue(created);

    const res = await service.registerAdult(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes/adult"),
      payload
    );
    expect(res.isMinor).toBe(false);
  });

  it("links sibling athlete via POST /sibling", async () => {
    const payload: LinkSiblingAthletePayload = {
      guardianPartyId: "guard-uuid-123",
      firstNameEn: "Thiago",
      lastNameEn: "Messi",
      firstNameAr: "تياغو",
      lastNameAr: "ميسي",
      dateOfBirth: "2012-11-02",
      gender: "Male",
      guardianName: "Jorge Messi",
      guardianPhone: "+966500000001",
      guardianRelationship: "Father",
      medicalClearanceSigned: true,
      guardianConsentSigned: true
    };

    const created = { id: "ath-sibling", ...payload, isMinor: true, status: "Active", participations: [] };
    mockApi.post.mockResolvedValue(created);

    const res = await service.linkSibling(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes/sibling"),
      payload
    );
    expect(res.guardianPartyId).toBe("guard-uuid-123");
  });

  it("searches guardians via GET /guardians", async () => {
    const mockGuardians = [
      { guardianPartyId: "g1", guardianName: "Jorge Messi", guardianPhone: "+966500000001", guardianRelationship: "Father", enrolledAthletesCount: 2 }
    ];
    mockApi.get.mockResolvedValue(mockGuardians);

    const res = await service.searchGuardians("Messi");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes/guardians?query=Messi")
    );
    expect(res).toEqual(mockGuardians);
  });

  it("fetches athlete QR via GET /{id}/qr", async () => {
    const mockQr = {
      membershipNumber: "ATH-00001",
      cardToken: "token-123",
      cardUrl: "/academy/card/token-123",
      qrCodeDataUri: "data:image/png;base64,abc"
    };
    mockApi.get.mockResolvedValue(mockQr);

    const res = await service.getAthleteQr("ath-1");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes/ath-1/qr")
    );
    expect(res).toEqual(mockQr);
  });

  it("fetches public athlete card via GET /card/{token}", async () => {
    const mockCard = {
      athleteId: "ath-1",
      membershipNumber: "ATH-00001",
      firstNameEn: "Leo",
      lastNameEn: "Messi",
      firstNameAr: "ليو",
      lastNameAr: "ميسي",
      academyName: "Al-Hilal Academy",
      primaryBranchName: "Main Branch",
      sports: ["Football"],
      status: "Active",
      intakeDate: "2026-11-10",
      cardToken: "token-123"
    };
    mockApi.get.mockResolvedValue(mockCard);

    const res = await service.getAthleteCard("token-123");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/athletes/card/token-123")
    );
    expect(res).toEqual(mockCard);
  });
});
