import { afterEach, describe, expect, it, vi } from "vitest";
import DOMPurify from "dompurify";
import { isValidURL, sanitizeHTML } from "./sanitize";

describe("rich-text-editor/sanitize", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks disallowed tag unwrapping XSS (<section><img onerror>, <font><a href=javascript:>)", () => {
    const sectionAttack = '<section><img src="x" onerror="alert(1)"></section>';
    const sectionClean = sanitizeHTML(sectionAttack);
    expect(sectionClean).not.toContain("onerror");
    expect(sectionClean).not.toContain("<section");
    expect(sectionClean).not.toContain('src="x"');

    const fontAttack = '<font><a href="javascript:alert(1)">Click</a></font>';
    const fontClean = sanitizeHTML(fontAttack);
    expect(fontClean).not.toContain("javascript:");
    expect(fontClean).not.toContain("<font");
    expect(fontClean).toContain(">Click</a>");
  });

  it("strips <template><script> and embedded XSS payloads", () => {
    const templateScript = "<template><script>alert(1)</script></template>";
    expect(sanitizeHTML(templateScript)).toBe("");

    const templateImg = '<template><img src="https://cdn.scripe.org/a.png" onerror="alert(1)"></template>';
    expect(sanitizeHTML(templateImg)).not.toContain("alert(1)");
    expect(sanitizeHTML(templateImg)).not.toContain("<template");
  });

  it("strips ASCII control characters, whitespace-obfuscated schemes, and unsafe protocols", () => {
    const vectors = [
      '<a href="\t\u0000java\tscript:alert(1)">bad</a>',
      '<a href="   javascript:alert(1)">bad</a>',
      '<a href="data:text/html,<script>alert(1)</script>">bad</a>',
      '<a href="vbscript:msgbox(1)">bad</a>',
      '<a href="//evil.com/phish">bad</a>',
      '<a href="/\\evil.com">bad</a>',
      '<img src="\u0007javascript:alert(1)" alt="x">',
      '<img src="data:image/svg+xml,<svg onload=alert(1)>" alt="x">',
    ];

    for (const vector of vectors) {
      const clean = sanitizeHTML(vector);
      expect(clean).not.toContain("href=");
      expect(clean).not.toContain("src=");
    }
  });

  it("strips dangerous tags and inline style vectors while preserving safe formatting", () => {
    const dirty =
      '<div style="background:url(javascript:alert(1))" onclick="alert(1)"><p>Hello <strong>world</strong></p><iframe src="https://evil.com"></iframe></div>';
    const clean = sanitizeHTML(dirty);
    expect(clean).toContain("<p>Hello <strong>world</strong></p>");
    expect(clean).not.toContain("style=");
    expect(clean).not.toContain("onclick=");
    expect(clean).not.toContain("<iframe");
  });

  it("preserves safe allowlisted URIs and enforces rel=noopener noreferrer on target=_blank", () => {
    const safeHtml =
      '<a href="  https://scripe.org/venues  " target="_blank">Venues</a>' +
      '<a href="mailto:ops@scripe.org">Mail</a>' +
      '<a href="tel:+201000000000">Call</a>' +
      '<a href="/dashboard">Home</a>' +
      '<a href="#top">Top</a>' +
      '<img src="https://cdn.scripe.org/pitch.png" alt="Pitch">';
    const clean = sanitizeHTML(safeHtml);
    const container = document.createElement("div");
    container.innerHTML = clean;

    const links = Array.from(container.querySelectorAll("a"));
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "https://scripe.org/venues",
      "mailto:ops@scripe.org",
      "tel:+201000000000",
      "/dashboard",
      "#top",
    ]);
    expect(links[0]?.getAttribute("rel")).toContain("noopener");
    expect(links[0]?.getAttribute("rel")).toContain("noreferrer");
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://cdn.scripe.org/pitch.png"
    );
  });

  it("fails closed when DOMPurify is unsupported or input is empty", () => {
    expect(sanitizeHTML("")).toBe("");
    vi.spyOn(DOMPurify, "isSupported", "get").mockReturnValue(false);
    expect(sanitizeHTML("<p>Safe</p>")).toBe("");
  });

  it("validates http/https URLs strictly and rejects control characters", () => {
    expect(isValidURL("https://scripe.org/path?a=1")).toBe(true);
    expect(isValidURL("  http://localhost:3000  ")).toBe(true);
    expect(isValidURL("javascript:alert(1)")).toBe(false);
    expect(isValidURL("java\tscript:alert(1)")).toBe(false);
    expect(isValidURL("https://sc\nripe.org")).toBe(false);
    expect(isValidURL("/relative/path")).toBe(false);
  });
});
