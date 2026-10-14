import { describe, expect, it } from "vitest";
import { DocsRepository } from "../data/repositories/DocsRepository";
import "../data/content/registry";

const docs = new DocsRepository();

describe("PartyKernel contract documentation", () => {
  it("publishes the typed create and tenant-scoped profile/lookup routes", () => {
    const page = docs.getPage("modules/party-kernel-overview");
    expect(page).toBeDefined();

    const content = JSON.stringify(page?.sections);
    expect(content).toContain("/api/v1/Parties/people");
    expect(content).toContain("/api/v1/Parties/organizations");
    expect(content).toContain("/api/v1/Parties/{encryptedPartyId}/profile");
    expect(content).toContain("/api/v1/Parties/people/lookup");
    expect(content).toContain("parties.create and party-people.create");
    expect(content).toContain("Idempotency-Key");
    expect(content).not.toContain("merge-candidates");
    expect(content).not.toContain("party-kernel/parties");
  });

  it("does not advertise CRM merge behavior as an implemented PartyKernel contract", () => {
    const page = docs.getPage("commercial/customer-360-party-kernel");
    expect(page).toBeDefined();

    const content = JSON.stringify(page?.sections);
    expect(content).toContain("CRM is not implemented by this contract");
    expect(content).toContain("There is no published duplicate-resolution");
    expect(content).not.toContain("Automated fuzzy deduplication");
  });
});
