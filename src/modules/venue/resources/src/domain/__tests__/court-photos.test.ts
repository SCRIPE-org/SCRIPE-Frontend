import { describe, it, expect } from "vitest";
import {
  extractCourtPhotos,
  extractCourtBio,
  packCourtPhotoMetadata,
  packCourtDescription,
  getDisplayCourtPhotos,
  DEFAULT_COURT_PHOTOS,
} from "../court-photos";

describe("court-photos domain utilities", () => {
  it("extracts empty array when description and photoMetadata have no photo data", () => {
    expect(extractCourtPhotos(null, "Indoor padel court")).toEqual([]);
    expect(extractCourtPhotos(null, null)).toEqual([]);
    expect(extractCourtPhotos(undefined, undefined)).toEqual([]);
  });

  it("extracts photos array from first-class photoMetadata", () => {
    const metadata = JSON.stringify(["https://media.scripe.org/img1.png", "https://media.scripe.org/img2.png"]);
    expect(extractCourtPhotos(metadata, "Some description")).toEqual([
      "https://media.scripe.org/img1.png",
      "https://media.scripe.org/img2.png",
    ]);
  });

  it("falls back to legacy description comment when photoMetadata is absent", () => {
    const desc = 'Championship Court\n\n<!-- court-photos: ["https://media.scripe.org/img1.png", "https://media.scripe.org/img2.png"] -->';
    expect(extractCourtPhotos(null, desc)).toEqual([
      "https://media.scripe.org/img1.png",
      "https://media.scripe.org/img2.png",
    ]);
  });

  it("extracts clean bio by removing legacy metadata comment", () => {
    const desc = 'Championship Court with panoramic glass.\n\n<!-- court-photos: ["https://media.scripe.org/img1.png"] -->';
    expect(extractCourtBio(desc)).toBe("Championship Court with panoramic glass.");
  });

  it("packs photo URLs into first-class metadata JSON", () => {
    const photos = ["https://media.scripe.org/img1.png", "https://media.scripe.org/img2.png"];
    const packed = packCourtPhotoMetadata(photos);

    expect(packed).toBe(JSON.stringify(photos));
    expect(extractCourtPhotos(packed)).toEqual(photos);
  });

  it("returns display court photos with defaults filling remaining slots", () => {
    const metadata = JSON.stringify(["https://media.scripe.org/img1.png"]);
    const display = getDisplayCourtPhotos(metadata);

    expect(display[0]).toBe("https://media.scripe.org/img1.png");
    expect(display.length).toBe(1 + DEFAULT_COURT_PHOTOS.length);
  });
});
