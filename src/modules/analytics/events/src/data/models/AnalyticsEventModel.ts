/**
 * AnalyticsEvent Model (DTO)
 *
 * API data transfer object for AnalyticsEvent. Mapper converts Model <-> Entity.
 */

export interface AnalyticsEventJson {
  id: string;
  eventName: string;
  sourceModule: string;
  occurredAt: string;
  subjectEntityTypeKey?: string | null;
  subjectEntityId?: string | null;
  associatedNumericValue?: number | null;
  tenantId?: string | null;
}

export interface AnalyticsDailyMetricJson {
  date: string;
  eventName: string;
  count: number;
  sum?: number;
}

export interface AnalyticsEventListResponseJson {
  items: AnalyticsEventJson[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export class AnalyticsEventModel {
  constructor(
    public readonly id: string,
    public readonly eventName: string,
    public readonly sourceModule: string,
    public readonly occurredAt: string,
    public readonly subjectEntityTypeKey?: string | null,
    public readonly subjectEntityId?: string | null,
    public readonly associatedNumericValue?: number | null,
    public readonly tenantId?: string | null
  ) {}

  static fromJson(json: AnalyticsEventJson): AnalyticsEventModel {
    return new AnalyticsEventModel(
      json.id,
      json.eventName,
      json.sourceModule,
      json.occurredAt,
      json.subjectEntityTypeKey,
      json.subjectEntityId,
      json.associatedNumericValue,
      json.tenantId
    );
  }
}

export class AnalyticsDailyMetricModel {
  constructor(
    public readonly date: string,
    public readonly eventName: string,
    public readonly count: number,
    public readonly sum?: number
  ) {}

  static fromJson(json: AnalyticsDailyMetricJson): AnalyticsDailyMetricModel {
    return new AnalyticsDailyMetricModel(
      json.date,
      json.eventName,
      json.count,
      json.sum
    );
  }
}
