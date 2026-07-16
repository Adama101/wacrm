import { describe, expect, it } from "vitest";
import { resolveWhatsAppAgentRole } from "./resolve-wa-role";

describe("resolveWhatsAppAgentRole", () => {
  it("disables agent for customer/guest contacts", () => {
    const role = resolveWhatsAppAgentRole(["Guest", "VIP"]);
    expect(role.enabled).toBe(false);
  });

  it("enables staff persona for Staff + FOH", () => {
    const role = resolveWhatsAppAgentRole(["Staff", "FOH"]);
    expect(role.enabled).toBe(true);
    expect(role.persona).toBe("staff");
    expect(role.sectorId).toBe("restaurant");
  });

  it("enables manager persona for Manager tags", () => {
    const role = resolveWhatsAppAgentRole(["Manager", "IRROPS"]);
    expect(role.enabled).toBe(true);
    expect(role.persona).toBe("manager");
    expect(role.sectorId).toBe("airline");
  });

  it("maps associate tags to retail", () => {
    const role = resolveWhatsAppAgentRole(["Staff", "Associate", "BOPIS"]);
    expect(role.sectorId).toBe("retail");
    expect(role.persona).toBe("staff");
  });
});
