"use client";

import { CommercialDocsView } from "./CommercialDocsView";

interface CommercialPageConnectorProps {
  slug: string;
}

/**
 * CommercialPageConnector — Thin client component that bridges
 * the server page.tsx to the CommercialDocsView client component.
 */
export function CommercialPageConnector({ slug }: CommercialPageConnectorProps) {
  return <CommercialDocsView slug={slug} />;
}
