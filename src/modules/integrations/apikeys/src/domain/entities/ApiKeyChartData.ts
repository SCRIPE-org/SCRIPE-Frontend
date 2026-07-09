export interface ApiKeyChartDataPoint {
  period: string;        // ISO datetime string
  totalHits: number;
  successHits: number;
  failureHits: number;
  avgResponseTimeMs: number;
}
