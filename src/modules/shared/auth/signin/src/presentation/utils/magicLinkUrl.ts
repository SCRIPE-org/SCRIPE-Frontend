/**
 * Extracts a magic-link token from query params or `#token=` URL fragment
 * and immediately strips `token` from browser history via `replaceState`.
 *
 * @module auth/signin/presentation/utils
 */
export function extractAndScrubMagicLinkToken(queryToken: string): string {
  let resolvedToken = queryToken;
  if (typeof window === "undefined") {
    return resolvedToken;
  }

  const url = new URL(window.location.href);
  let mutated = false;
  if (url.searchParams.has("token")) {
    url.searchParams.delete("token");
    mutated = true;
  }
  if (url.hash) {
    const hashParams = new URLSearchParams(
      url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
    );
    const hashToken = (hashParams.get("token") || "").trim();
    if (!resolvedToken && hashToken) {
      resolvedToken = hashToken;
    }
    if (hashParams.has("token")) {
      hashParams.delete("token");
      const remainingHash = hashParams.toString();
      url.hash = remainingHash ? `#${remainingHash}` : "";
      mutated = true;
    }
  }
  if (mutated) {
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }
  return resolvedToken;
}
