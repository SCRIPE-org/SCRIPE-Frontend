import type { Metadata } from "next";
import { TechnicalPageConnector } from "@modules/docs/src/presentation/views/TechnicalPageConnector";
import { docsContainer } from "@modules/docs/di";
import { allDocsEn } from "@modules/docs/src/locales/docs-registry";

interface Props {
  params: Promise<{ slug: string[] }>;
}

// Same dot-path key resolution DocsI18nProvider's t() uses at runtime, minus the
// language switch — generateMetadata runs server-side before any client i18n
// context mounts, so the English copy is what tab titles / OG tags get.
function resolveDocsKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let value: unknown = allDocsEn;
  for (const part of key.split(".")) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof value === "string" ? value : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const page = docsContainer.docsRepository.getPage(fullSlug);

  const title = resolveDocsKey(page?.titleKey);
  const description = resolveDocsKey(page?.descriptionKey);

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

export default async function DocsSlugPage({ params }: Props) {
  const { slug } = await params;
  const fullSlug = slug.join("/");

  return <TechnicalPageConnector slug={fullSlug} />;
}
