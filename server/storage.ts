import { 
  queryHistory, 
  adSalesMetrics, 
  totalSalesMetrics, 
  eligibilityTable,
  type QueryHistory,
  type InsertQueryHistory,
  type AdSalesMetrics,
  type InsertAdSalesMetrics,
  type TotalSalesMetrics,
  type InsertTotalSalesMetrics,
  type EligibilityTable,
  type InsertEligibilityTable
} from "@shared/schema";

export interface IStorage {
  // Query History
  createQueryHistory(history: InsertQueryHistory): Promise<QueryHistory>;
  getQueryHistory(limit?: number): Promise<QueryHistory[]>;
  clearQueryHistory(): Promise<void>;

  // Ad Sales Metrics
  createAdSalesMetric(metric: InsertAdSalesMetrics): Promise<AdSalesMetrics>;
  getAdSalesMetrics(): Promise<AdSalesMetrics[]>;
  bulkInsertAdSalesMetrics(metrics: InsertAdSalesMetrics[]): Promise<void>;

  // Total Sales Metrics
  createTotalSalesMetric(metric: InsertTotalSalesMetrics): Promise<TotalSalesMetrics>;
  getTotalSalesMetrics(): Promise<TotalSalesMetrics[]>;
  bulkInsertTotalSalesMetrics(metrics: InsertTotalSalesMetrics[]): Promise<void>;

  // Eligibility Table
  createEligibilityEntry(entry: InsertEligibilityTable): Promise<EligibilityTable>;
  getEligibilityTable(): Promise<EligibilityTable[]>;
  bulkInsertEligibilityEntries(entries: InsertEligibilityTable[]): Promise<void>;

  // Analytics
  executeRawQuery(sql: string): Promise<any[]>;
  getDataCounts(): Promise<{ adSales: number; totalSales: number; eligibility: number }>;
}

export class MemStorage implements IStorage {
  private queryHistoryStore: Map<number, QueryHistory>;
  private adSalesStore: Map<number, AdSalesMetrics>;
  private totalSalesStore: Map<number, TotalSalesMetrics>;
  private eligibilityStore: Map<number, EligibilityTable>;
  private currentId: number;

  constructor() {
    this.queryHistoryStore = new Map();
    this.adSalesStore = new Map();
    this.totalSalesStore = new Map();
    this.eligibilityStore = new Map();
    this.currentId = 1;
  }

  async createQueryHistory(history: InsertQueryHistory): Promise<QueryHistory> {
    const id = this.currentId++;
    const entry: QueryHistory = {
      ...history,
      id,
      timestamp: new Date(),
    };
    this.queryHistoryStore.set(id, entry);
    return entry;
  }

  async getQueryHistory(limit: number = 10): Promise<QueryHistory[]> {
    const entries = Array.from(this.queryHistoryStore.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    return entries;
  }

  async clearQueryHistory(): Promise<void> {
    this.queryHistoryStore.clear();
  }

  async createAdSalesMetric(metric: InsertAdSalesMetrics): Promise<AdSalesMetrics> {
    const id = this.currentId++;
    const entry: AdSalesMetrics = { ...metric, id };
    this.adSalesStore.set(id, entry);
    return entry;
  }

  async getAdSalesMetrics(): Promise<AdSalesMetrics[]> {
    return Array.from(this.adSalesStore.values());
  }

  async bulkInsertAdSalesMetrics(metrics: InsertAdSalesMetrics[]): Promise<void> {
    for (const metric of metrics) {
      await this.createAdSalesMetric(metric);
    }
  }

  async createTotalSalesMetric(metric: InsertTotalSalesMetrics): Promise<TotalSalesMetrics> {
    const id = this.currentId++;
    const entry: TotalSalesMetrics = { ...metric, id };
    this.totalSalesStore.set(id, entry);
    return entry;
  }

  async getTotalSalesMetrics(): Promise<TotalSalesMetrics[]> {
    return Array.from(this.totalSalesStore.values());
  }

  async bulkInsertTotalSalesMetrics(metrics: InsertTotalSalesMetrics[]): Promise<void> {
    for (const metric of metrics) {
      await this.createTotalSalesMetric(metric);
    }
  }

  async createEligibilityEntry(entry: InsertEligibilityTable): Promise<EligibilityTable> {
    const id = this.currentId++;
    const newEntry: EligibilityTable = { ...entry, id };
    this.eligibilityStore.set(id, newEntry);
    return newEntry;
  }

  async getEligibilityTable(): Promise<EligibilityTable[]> {
    return Array.from(this.eligibilityStore.values());
  }

  async bulkInsertEligibilityEntries(entries: InsertEligibilityTable[]): Promise<void> {
    for (const entry of entries) {
      await this.createEligibilityEntry(entry);
    }
  }

  async executeRawQuery(sql: string): Promise<any[]> {
    // Simple in-memory SQL-like query execution
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('ad_sales_metrics')) {
      const data = Array.from(this.adSalesStore.values());
      return this.processQuery(data, sql);
    } else if (lowerSql.includes('total_sales_metrics')) {
      const data = Array.from(this.totalSalesStore.values());
      return this.processQuery(data, sql);
    } else if (lowerSql.includes('eligibility_table')) {
      const data = Array.from(this.eligibilityStore.values());
      return this.processQuery(data, sql);
    }
    
    return [];
  }

  private processQuery(data: any[], sql: string): any[] {
    // Basic query processing - in a real app this would be more sophisticated
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('sum(')) {
      const field = this.extractFieldFromSum(sql);
      const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
      return [{ [field]: sum, total: sum }];
    }
    
    if (lowerSql.includes('count(')) {
      return [{ count: data.length }];
    }
    
    if (lowerSql.includes('order by') && lowerSql.includes('desc')) {
      const field = this.extractOrderField(sql);
      return data.sort((a, b) => (b[field] || 0) - (a[field] || 0)).slice(0, 10);
    }
    
    return data.slice(0, 100); // Return first 100 rows by default
  }

  private extractFieldFromSum(sql: string): string {
    const match = sql.match(/sum\((\w+)\)/i);
    return match ? match[1] : 'total_revenue';
  }

  private extractOrderField(sql: string): string {
    const match = sql.match(/order by (\w+)/i);
    return match ? match[1] : 'id';
  }

  async getDataCounts(): Promise<{ adSales: number; totalSales: number; eligibility: number }> {
    return {
      adSales: this.adSalesStore.size,
      totalSales: this.totalSalesStore.size,
      eligibility: this.eligibilityStore.size,
    };
  }
}

export const storage = new MemStorage();
