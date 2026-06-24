/**
 * ThemeDetail — Domain entity for theme detail view
 *
 * Extends ThemeCard with additional preview/metadata fields.
 *
 * @module customization/domain
 */
import { ThemeCard, type ThemeCardData } from "./ThemeCard";

export interface ThemeDetailData extends ThemeCardData {
  longDescription: string;
  previewImageUrl: string;
  previewDarkImageUrl: string;
  screenshots: string[];
  compatibleLayouts: string;
  themeDataJson: string;
  themeSchemaVersion: number;
  replacedBySlug: string;
  displayOrder: number;
}

/**
 * Domain model representing a Theme Detail structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ThemeDetail extends ThemeCard {
  private readonly detailData: ThemeDetailData;

  constructor(data: ThemeDetailData) {
    super(data);
    this.detailData = data;
  }

  get longDescription() {
    return this.detailData.longDescription;
  }
  get previewImageUrl() {
    return this.detailData.previewImageUrl;
  }
  get previewDarkImageUrl() {
    return this.detailData.previewDarkImageUrl;
  }
  get screenshots() {
    return this.detailData.screenshots;
  }
  get compatibleLayouts() {
    return this.detailData.compatibleLayouts;
  }
  get themeDataJson() {
    return this.detailData.themeDataJson;
  }
  get themeSchemaVersion() {
    return this.detailData.themeSchemaVersion;
  }
  get replacedBySlug() {
    return this.detailData.replacedBySlug;
  }
  get displayOrder() {
    return this.detailData.displayOrder;
  }

  /** Has a replacement theme available? */
  get hasReplacement() {
    return !!this.detailData.replacedBySlug;
  }

  copyWith(updates: Partial<ThemeDetailData>): ThemeDetail {
    return new ThemeDetail({
      ...this.detailData,
      ...updates,
    } as ThemeDetailData);
  }
}
