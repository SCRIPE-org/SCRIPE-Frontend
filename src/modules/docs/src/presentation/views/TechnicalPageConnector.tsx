"use client";

import { TechnicalDocsView } from "./TechnicalDocsView";

// Content registration — ensures all pages are available
import "../../data/content/registry";

interface TechnicalPageConnectorProps {
  slug: string;
}

/**
 * TechnicalPageConnector — Thin client component that bridges
 * the server page.tsx to the TechnicalDocsView client component.
 */
export function TechnicalPageConnector({ slug }: TechnicalPageConnectorProps) {
  return <TechnicalDocsView slug={slug} />;
}
