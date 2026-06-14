// ═══════════════════════════════════════════════════════════════════════════
// SignupMapper — focused unit tests (Vitest)
//
// Covers the E2 additions: welcome-content + adaptive-recommendation mappers.
// These are schema-parse mappers, so the tests assert that the wire shapes
// (camelCase, mirroring the backend DTOs) round-trip cleanly into domain
// entities, that optional/additive fields flow through, and that unknown keys
// are stripped.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { SignupMapper } from "./SignupMapper";
import type {
  SignupWelcomeContentDto,
  OnboardingRecommendationDto,
} from "../models/SignupModels";

describe("SignupMapper.toWelcomeContent", () => {
  it("maps the full welcome-content wire shape to a domain entity", () => {
    const dto: SignupWelcomeContentDto = {
      headline: "Build faster",
      subcopy: "Everything you need to launch.",
      ctaLabel: "Get started",
      trustedByCount: 12000,
      trustedByLabel: "teams trust us",
      trustMarks: [
        { key: "soc2", kind: "compliance", label: "SOC 2", iconKey: "shield", assetUrl: null },
        { key: "gdpr", kind: "compliance", label: "GDPR", iconKey: null, assetUrl: "https://x/g.svg" },
      ],
      customerLogos: [{ key: "acme", name: "Acme", assetUrl: "https://x/acme.svg" }],
    };

    const entity = SignupMapper.toWelcomeContent(dto);

    expect(entity.headline).toBe("Build faster");
    expect(entity.trustedByCount).toBe(12000);
    expect(entity.trustMarks).toHaveLength(2);
    expect(entity.trustMarks[0].assetUrl).toBeNull();
    expect(entity.trustMarks[1].iconKey).toBeNull();
    expect(entity.customerLogos[0].name).toBe("Acme");
  });

  it("handles empty trust-mark and logo arrays", () => {
    const dto: SignupWelcomeContentDto = {
      headline: "h",
      subcopy: "s",
      ctaLabel: "c",
      trustedByCount: 0,
      trustedByLabel: "l",
      trustMarks: [],
      customerLogos: [],
    };

    const entity = SignupMapper.toWelcomeContent(dto);

    expect(entity.trustMarks).toEqual([]);
    expect(entity.customerLogos).toEqual([]);
  });
});

describe("SignupMapper.toOnboardingRecommendation", () => {
  it("maps the recommendation wire shape including optional diagnostic fields", () => {
    const dto: OnboardingRecommendationDto = {
      recommendedEditionId: "enc_abc123",
      recommendedEditionName: "Pro",
      score: 42,
      reasons: ["recommendation.reason.team.small", "recommendation.reason.vertical_match"],
      tierKey: "pro",
      isSelfService: true,
    };

    const entity = SignupMapper.toOnboardingRecommendation(dto);

    expect(entity.recommendedEditionId).toBe("enc_abc123");
    expect(entity.recommendedEditionName).toBe("Pro");
    expect(entity.score).toBe(42);
    expect(entity.reasons).toHaveLength(2);
    expect(entity.tierKey).toBe("pro");
    expect(entity.isSelfService).toBe(true);
  });

  it("tolerates a response missing the additive diagnostic fields", () => {
    const dto = {
      recommendedEditionId: "enc_x",
      recommendedEditionName: "Free",
      score: 0,
      reasons: [],
    } as OnboardingRecommendationDto;

    const entity = SignupMapper.toOnboardingRecommendation(dto);

    expect(entity.recommendedEditionName).toBe("Free");
    expect(entity.tierKey).toBeUndefined();
    expect(entity.isSelfService).toBeUndefined();
  });

  it("strips unknown keys not present in the schema", () => {
    const dto = {
      recommendedEditionId: "enc_y",
      recommendedEditionName: "Ultra",
      score: 99,
      reasons: ["r"],
      tierKey: "ultra",
      isSelfService: true,
      // legacy/extra field the schema does not declare
      legacyTier: "enterprise",
    } as unknown as OnboardingRecommendationDto;

    const entity = SignupMapper.toOnboardingRecommendation(dto);

    expect(entity).not.toHaveProperty("legacyTier");
    expect(entity.tierKey).toBe("ultra");
  });
});
