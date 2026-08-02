/**
 * Comparison Sub-Components — barrel export
 *
 * Four entries left here when the shared MatrixCell absorbed them:
 * ComparisonDataRow, ComparisonSectionRow, FeatureValueCell and PriceCell were
 * each a private re-cut of "label cell plus one value cell per column" with no
 * consumer left in the product — three of them disagreed with each other about
 * how an absent value reads.
 */
export { BooleanIndicator } from "./BooleanIndicator";
export { ComparisonColumnHeader, comparisonHighlightClasses } from "./ComparisonColumnHeader";
export { RecommendationBadge } from "./RecommendationBadge";
export { FloatingCompareButton } from "./FloatingCompareButton";
export { CategorySectionHeader } from "./CategorySectionHeader";
export { EditionPricingCard } from "./EditionPricingCard";
