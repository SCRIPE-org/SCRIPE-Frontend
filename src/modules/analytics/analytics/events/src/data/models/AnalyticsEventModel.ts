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
  // Matches the backend's AnalyticsEventResponse.Value (Analytics.Application/DTOs/
  // AnalyticsEventResponse.cs) exactly -- the wire key is "value" under the API's
  // camelCase JSON policy, not "associatedNumericValue".
  value?: number | null;
  tenantId?: string | null;
}

// Matches the backend's AnalyticsDailyMetricResponse (Analytics.Application/DTOs/
// AnalyticsDailyMetricResponse.cs) field-for-field: eventName, bucketDateUtc, count,
// valueSum, valueMin, valueMax, lastEventAt. The backend never sends "date"/"sum".
export interface AnalyticsDailyMetricJson {
  eventName: string;
  bucketDateUtc: string;
  count: number;
  valueSum: number;
  valueMin?: number | null;
  valueMax?: number | null;
  lastEventAt: string;
}

export interface AnalyticsEventListResponseJson {
  items: AnalyticsEventJson[];
  totalCount: number;
  pageNumber: number;
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
    public readonly value?: number | null,
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
      json.value,
      json.tenantId
    );
  }
}

export class AnalyticsDailyMetricModel {
  constructor(
    public readonly eventName: string,
    public readonly bucketDateUtc: string,
    public readonly count: number,
    public readonly valueSum: number,
    public readonly lastEventAt: string,
    public readonly valueMin?: number | null,
    public readonly valueMax?: number | null
  ) {}

  static fromJson(json: AnalyticsDailyMetricJson): AnalyticsDailyMetricModel {
    return new AnalyticsDailyMetricModel(
      json.eventName,
      json.bucketDateUtc,
      json.count,
      json.valueSum,
      json.lastEventAt,
      json.valueMin,
      json.valueMax
    );
  }
}
