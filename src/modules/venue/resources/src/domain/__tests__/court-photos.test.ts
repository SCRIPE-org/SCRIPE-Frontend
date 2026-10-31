import { describe, it, expect } from "vitest";
import {
  extractCourtPhotos,
  extractCourtBio,
  packCourtDescription,
  getDisplayCourtPhotos,
  DEFAULT_COURT_PHOTOS,
} from "../court-photos";

describe("court-photos domain utilities", () => {
  it("extracts empty array when description has no photo metadata", () => {
    expect(extractCourtPhotos("Indoor padel court")).toEqual([]);
    expect(extractCourtPhotos(null)).toEqual([]);
    expect(extractCourtPhotos(undefined)).toEqual([]);
  });

  it("extracts photos array when metadata comment is present", () => {
    const desc = 'Championship Court\n\n<!-- court-photos: ["https://media.scripe.org/img1.png", "https://media.scripe.org/img2.png"] -->';
    expect(extractCourtPhotos(desc)).toEqual([
      "https://media.scripe.org/img1.png",
      "https://media.scripe.org/img2.png",
    ]);
  });

  it("extracts clean bio by removing metadata comment", () => {
    const desc = 'Championship Court with panoramic glass.\n\n<!-- court-photos: ["https://media.scripe.org/img1.png"] -->';
    expect(extractCourtBio(desc)).toBe("Championship Court with panoramic glass.");
  });

  it("packs bio and photos into persisted description format", () => {
    const bio = "Championship Court with panoramic glass.";
    const photos = ["https://media.scripe.org/img1.png"];
    const packed = packCourtDescription(bio, photos);

    expect(packed).toContain(bio);
    expect(packed).toContain('<!-- court-photos: ["https://media.scripe.org/img1.png"] -->');
    expect(extractCourtPhotos(packed)).toEqual(photos);
    expect(extractCourtBio(packed)).toBe(bio);
  });

  it("returns display court photos with defaults filling remaining slots", () => {
    const desc = '<!-- court-photos: ["https://media.scripe.org/img1.png"] -->';
    const display = getDisplayCourtPhotos(desc);

    expect(display[0]).toBe("https://media.scripe.org/img1.png");
    expect(display.length).toBe(1 + DEFAULT_COURT_PHOTOS.length);
  });
});
