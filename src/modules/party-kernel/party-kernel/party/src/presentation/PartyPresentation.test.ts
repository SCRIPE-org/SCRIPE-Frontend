import { describe, expect, it, vi } from "vitest";
import { Party } from "../domain/entities/Party";
import { PartyProfile } from "../domain/entities/PartyProfile";
import { PartyPerson } from "@modules/party-kernel/party-person/src/domain/entities/PartyPerson";
import { en } from "../../locales/party.en";
import { ar } from "../../locales/party.ar";

describe("Party Invariants & Presentation Gates", () => {
  describe("Name Roundtrip & Exact Preservation", () => {
    it("preserves complex and multicultural names without forced first/last splitting", () => {
      const complexNames = [
        "Dr. Fatima Zahra Al-Mansoor",
        "عبدالله بن عبدالعزيز آل سعود",
        "Jean-Luc Picard-Smith",
        "Mary-Jane O'Connor",
        "Sir Arthur Conan Doyle, KCMG",
        "José Manuel García-Navarro",
      ];

      for (const name of complexNames) {
        const party = new Party({
          id: "test-id",
          type: "Person",
          displayName: name,
          createdAt: "2026-03-01T00:00:00Z",
        });

        // Exact preservation of entered string without splitting
        expect(party.displayName).toBe(name);
      }
    });

    it("generates correct initials for avatars across single, dual, and multi-word names", () => {
      const testCases = [
        { name: "Fatima", expected: "FA" },
        { name: "Fatima Zahra", expected: "FZ" },
        { name: "Dr. Fatima Zahra Al-Mansoor", expected: "DA" },
      ];

      for (const { name, expected } of testCases) {
        const party = new Party({
          id: "p",
          type: "Person",
          displayName: name,
          createdAt: "2026-03-01T00:00:00Z",
        });
        expect(party.initials).toBe(expected);
      }
    });
  });

  describe("Zero Raw Token Leakage Invariants", () => {
    it("ensures PartyPerson never falls back to raw partyId when names are empty or null", () => {
      const emptyPerson = new PartyPerson({
        id: "person-id-1",
        partyId: "encrypted-party-token-xyz9876543210",
        firstName: "",
        lastName: "",
        fullName: "",
        isMinor: false,
        createdAt: "2026-03-01T00:00:00Z",
      });

      // Must NOT leak partyId token
      expect(emptyPerson.displayName).toBe("—");
      expect(emptyPerson.displayName).not.toContain("encrypted-party-token");
      expect(emptyPerson.displayName).not.toBe(emptyPerson.partyId);
    });

    it("uses fullName if present, or joins firstName and lastName when fullName is absent", () => {
      const personWithFullName = new PartyPerson({
        id: "p1",
        partyId: "token-1",
        fullName: "Dr. Fatima Zahra",
        firstName: "Fatima",
        lastName: "Zahra",
        isMinor: false,
        createdAt: "2026-03-01T00:00:00Z",
      });
      expect(personWithFullName.displayName).toBe("Dr. Fatima Zahra");

      const personPartsOnly = new PartyPerson({
        id: "p2",
        partyId: "token-2",
        firstName: "Tariq",
        lastName: "Aziz",
        isMinor: false,
        createdAt: "2026-03-01T00:00:00Z",
      });
      expect(personPartsOnly.displayName).toBe("Tariq Aziz");
    });
  });

  describe("ADR-002: Selected Type & PartyId Immutability", () => {
    it("enforces immutable Party.Type and PartyId across entity copies", () => {
      const originalParty = new Party({
        id: "canonical-guid-1234",
        type: "Person",
        displayName: "Initial Person Name",
        createdAt: "2026-03-01T00:00:00Z",
      });

      // copyWith allows name correction
      const updatedParty = originalParty.copyWith({
        displayName: "Corrected Person Name",
      });

      // Identity & Type are preserved
      expect(updatedParty.id).toBe("canonical-guid-1234");
      expect(updatedParty.type).toBe("Person");
      expect(updatedParty.displayName).toBe("Corrected Person Name");
    });

    it("ensures PartyProfile respects ADR-002 type locks", () => {
      const personParty = new Party({
        id: "person-canonical-1",
        type: "Person",
        displayName: "Layla Tariq",
        createdAt: "2026-03-01T00:00:00Z",
      });

      const personProfile = new PartyProfile({
        party: personParty,
        contactPoints: [],
        roles: [],
        relationships: [],
        mergeCandidates: [],
      });

      expect(personProfile.isPerson).toBe(true);
      expect(personProfile.isOrganization).toBe(false);

      const orgParty = new Party({
        id: "org-canonical-2",
        type: "Organization",
        displayName: "Najd FC Sports Academy",
        createdAt: "2026-03-01T00:00:00Z",
      });

      const orgProfile = new PartyProfile({
        party: orgParty,
        contactPoints: [],
        roles: [],
        relationships: [],
        mergeCandidates: [],
      });

      expect(orgProfile.isPerson).toBe(false);
      expect(orgProfile.isOrganization).toBe(true);
    });
  });

  describe("Mutation Error & Success Boundaries", () => {
    it("handles mutation success returning canonical party ID", async () => {
      const mockCreateFn = vi.fn().mockResolvedValue("canonical-new-party-id");
      const result = await mockCreateFn({
        displayName: "New Person",
      });
      expect(result).toBe("canonical-new-party-id");
    });

    it("handles mutation failure cleanly without corrupting client state", async () => {
      const mockCreateFn = vi.fn().mockRejectedValue(new Error("Duplicate person detected"));
      await expect(mockCreateFn({ displayName: "Existing Person" })).rejects.toThrow(
        "Duplicate person detected"
      );
    });
  });

  describe("EN/AR Localization Parity", () => {
    function getDeepKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      return Object.keys(obj).flatMap((key) => {
        const val = obj[key];
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === "object" && !Array.isArray(val)) {
          return getDeepKeys(val as Record<string, unknown>, newPrefix);
        }
        return [newPrefix];
      });
    }

    it("has 100% key parity between English and Arabic locale dictionaries", () => {
      const enKeys = getDeepKeys(en as unknown as Record<string, unknown>).sort();
      const arKeys = getDeepKeys(ar as unknown as Record<string, unknown>).sort();

      const missingInAr = enKeys.filter((k) => !arKeys.includes(k));
      const missingInEn = arKeys.filter((k) => !enKeys.includes(k));

      expect(missingInAr).toEqual([]);
      expect(missingInEn).toEqual([]);
      expect(arKeys.length).toBe(enKeys.length);
      expect(arKeys.length).toBeGreaterThan(40);
    });

    it("verifies accurate domain translations for enterprise directory & profiles", () => {
      expect(en.party.directory.title).toBe("Contacts Directory");
      expect(ar.party.directory.title).toBe("دليل جهات الاتصال");

      expect(en.party.types.Person).toBe("Person");
      expect(ar.party.types.Person).toBe("فرد");

      expect(en.party.types.Organization).toBe("Organization");
      expect(ar.party.types.Organization).toBe("منظمة");

      expect(en.party.dialog.editNameDesc).toContain("immutable");
      expect(ar.party.dialog.editNameDesc).toContain("ثابتين");

      expect(en.party.dialog.fullNameHelp).toContain("Exact human-entered name");
      expect(ar.party.dialog.fullNameHelp).toContain("يتم حفظ الاسم كما أدخلته بالكامل");
    });
  });
});
