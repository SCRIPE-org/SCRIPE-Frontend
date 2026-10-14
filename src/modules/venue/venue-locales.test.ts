import { describe, expect, it } from "vitest";
import { en as profileEn } from "./facility-resource-profile/locales/resource-profile.en";
import { ar as profileAr } from "./facility-resource-profile/locales/resource-profile.ar";
import { en as availabilityEn } from "./availability/locales/availability.en";
import { ar as availabilityAr } from "./availability/locales/availability.ar";
import { en as bookingEn } from "./booking/locales/booking.en";
import { ar as bookingAr } from "./booking/locales/booking.ar";
import { en as calendarEn } from "./operations-calendar/locales/operations-calendar.en";
import { ar as calendarAr } from "./operations-calendar/locales/operations-calendar.ar";
import { en as resourcesEn } from "./resources/locales/resources.en";
import { ar as resourcesAr } from "./resources/locales/resources.ar";
import { en as venueProfileEn } from "./venue-profile/locales/venue-profile.en";
import { ar as venueProfileAr } from "./venue-profile/locales/venue-profile.ar";
import { en as guestPortalEn } from "./guest-portal/locales/guest-portal.en";
import { ar as guestPortalAr } from "./guest-portal/locales/guest-portal.ar";
import { en as customersEn } from "./customers/locales/customers.en";
import { ar as customersAr } from "./customers/locales/customers.ar";
import { en as reportsEn } from "./reports/locales/reports.en";
import { ar as reportsAr } from "./reports/locales/reports.ar";
import { en as settingsEn } from "./settings/locales/settings.en";
import { ar as settingsAr } from "./settings/locales/settings.ar";
import { en as sharedEn } from "./shared/locales/shared.en";
import { ar as sharedAr } from "./shared/locales/shared.ar";

function leafKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, nested]) =>
    leafKeys(nested, prefix ? `${prefix}.${key}` : key)
  );
}

describe("Venue operator locales", () => {
  it("keeps Resource Profile English and Arabic keys in parity", () => {
    expect(leafKeys(profileAr).sort()).toEqual(leafKeys(profileEn).sort());
  });

  it("keeps Availability English and Arabic keys in parity", () => {
    expect(leafKeys(availabilityAr).sort()).toEqual(leafKeys(availabilityEn).sort());
  });

  it("keeps Booking Workspace English and Arabic keys in parity", () => {
    expect(leafKeys(bookingAr).sort()).toEqual(leafKeys(bookingEn).sort());
  });

  it("keeps Operations Calendar English and Arabic keys in parity", () => {
    expect(leafKeys(calendarAr).sort()).toEqual(leafKeys(calendarEn).sort());
  });

  it("keeps Resources Workspace English and Arabic keys in parity", () => {
    expect(leafKeys(resourcesAr).sort()).toEqual(leafKeys(resourcesEn).sort());
  });

  it("keeps Venue Profile English and Arabic keys in parity", () => {
    expect(leafKeys(venueProfileAr).sort()).toEqual(leafKeys(venueProfileEn).sort());
  });

  it("keeps Guest Portal English and Arabic keys in parity", () => {
    expect(leafKeys(guestPortalAr).sort()).toEqual(leafKeys(guestPortalEn).sort());
  });

  it("keeps Customers English and Arabic keys in parity", () => {
    expect(leafKeys(customersAr).sort()).toEqual(leafKeys(customersEn).sort());
  });

  it("keeps Reports English and Arabic keys in parity", () => {
    expect(leafKeys(reportsAr).sort()).toEqual(leafKeys(reportsEn).sort());
  });

  it("keeps Settings English and Arabic keys in parity", () => {
    expect(leafKeys(settingsAr).sort()).toEqual(leafKeys(settingsEn).sort());
  });

  it("keeps Shared English and Arabic keys in parity", () => {
    expect(leafKeys(sharedAr).sort()).toEqual(leafKeys(sharedEn).sort());
  });

  it("ships native Arabic operator copy", () => {
    expect(profileAr.resourceProfile.title).toMatch(/[\u0600-\u06ff]/);
    expect(availabilityAr.availability.title).toMatch(/[\u0600-\u06ff]/);
    expect(bookingAr.booking.title).toMatch(/[\u0600-\u06ff]/);
    expect(bookingAr.booking.hold.conflictDescription).toMatch(/[\u0600-\u06ff]/);
    expect(calendarAr.operationsCalendar.title).toMatch(/[\u0600-\u06ff]/);
    expect(resourcesAr.resources.title).toMatch(/[\u0600-\u06ff]/);
    expect(resourcesAr.resources.wizard.title).toMatch(/[\u0600-\u06ff]/);
    expect(venueProfileAr.venueProfile.title).toMatch(/[\u0600-\u06ff]/);
    expect(guestPortalAr.guestPortal.title).toMatch(/[\u0600-\u06ff]/);
    expect(customersAr.venueCustomers.title).toMatch(/[\u0600-\u06ff]/);
    expect(reportsAr.venueReports.title).toMatch(/[\u0600-\u06ff]/);
    expect(settingsAr.venueSettings.title).toMatch(/[\u0600-\u06ff]/);
    expect(sharedAr.venueShared.status.draft).toMatch(/[\u0600-\u06ff]/);
  });
});
