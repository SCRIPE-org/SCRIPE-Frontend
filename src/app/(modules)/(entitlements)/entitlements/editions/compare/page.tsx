/**
 * Edition Comparison Page — Next.js route page.
 *
 * Renders the EditionComparisonView which follows:
 * View → ViewModel → Repository → Service → HTTP
 */
import { EditionComparisonView } from "@modules/entitlements/editions/src/presentation/views/EditionComparisonView";

export default function EditionComparisonPage() {
  return <EditionComparisonView />;
}
