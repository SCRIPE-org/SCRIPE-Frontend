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
  const [resolved, setResolved] = useState<string>(() =>
    value && isAbsoluteUrl(value) ? value : ""
  );

  useEffect(() => {
    let cancelled = false;

    if (!value) {
      setResolved("");
      return;
    }

    if (isAbsoluteUrl(value)) {
      setResolved(value);
      return;
    }

    // Clear any stale (previous file's) URL while the new one resolves.
    setResolved("");

    getSessionDownloadUrl(value).then((url) => {
      if (!cancelled) setResolved(url ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  return resolved;
}
