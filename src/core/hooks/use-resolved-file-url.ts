"use client";

/**
 * useResolvedFileUrl — renders protected server-hosted media without a
 * Bearer header.
 *
 * `resolveFileUrl()` in `@core/common/utils` still exists for synchronous,
 * non-rendering conversions (round-tripping a form value through
 * resolveFileUrl/unresolveFileUrl, or building a value inside an already-
 * async upload handler) — it cannot itself mint a session because minting
 * one is an async network call and it is called from non-component code
 * that cannot use hooks.
 *
 * Anywhere a value is actually painted into an `<img>`/`<video src>`, use
 * this hook instead: it mints (or reuses a cached) DownloadsController
 * session for relative paths and returns the anonymous-safe redemption URL,
 * re-rendering once it resolves. Absolute http(s) values (already-public
 * cloud-storage/CDN URLs) pass through unchanged, synchronously.
 */
import { useEffect, useState } from "react";
import { getSessionDownloadUrl } from "@core/services/media-session.service";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function useResolvedFileUrl(value: string | null | undefined): string {
  // Which relative `value` `resolvedUrl` belongs to, so a stale URL from the
  // previous value can be detected and hidden without an effect-driven "clear"
  // setState (the `!value`/absolute-URL cases are synchronously derivable below,
  // so only the genuine async lookup needs an effect at all).
  const [resolvedFor, setResolvedFor] = useState<string | null | undefined>(undefined);
  const [resolvedUrl, setResolvedUrl] = useState<string>("");

  useEffect(() => {
    if (!value || isAbsoluteUrl(value)) return;

    let cancelled = false;

    getSessionDownloadUrl(value).then((url) => {
      if (!cancelled) {
        setResolvedFor(value);
        setResolvedUrl(url ?? "");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!value) return "";
  if (isAbsoluteUrl(value)) return value;
  return resolvedFor === value ? resolvedUrl : "";
}
