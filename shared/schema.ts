import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Query History Table
export const queryHistory = pgTable("query_history", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  sql: text("sql").notNull(),
  result: text("result").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Ad Sales Metrics Table
export const adSalesMetrics = pgTable("ad_sales_metrics", {
  id: serial("id").primaryKey(),
  product_name: text("product_name").notNull(),
  campaign_name: text("campaign_name"),
  ad_spend: real("ad_spend"),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  cpc: real("cpc"),
  ctr: real("ctr"),
  conversions: integer("conversions"),
  conversion_rate: real("conversion_rate"),
  roas: real("roas"),
});

// Total Sales Metrics Table
export const totalSalesMetrics = pgTable("total_sales_metrics", {
  id: serial("id").primaryKey(),
  product_name: text("product_name").notNull(),
  category: text("category"),
  total_revenue: real("total_revenue"),
  units_sold: integer("units_sold"),
  avg_order_value: real("avg_order_value"),
  profit_margin: real("profit_margin"),
  customer_acquisition_cost: real("customer_acquisition_cost"),
});

// Eligibility Table
export const eligibilityTable = pgTable("eligibility_table", {
  id: serial("id").primaryKey(),
  product_name: text("product_name").notNull(),
  eligible_for_ads: boolean("eligible_for_ads").default(false),
  category_restrictions: text("category_restrictions"),
  min_order_quantity: integer("min_order_quantity"),
  max_order_quantity: integer("max_order_quantity"),
  geographic_restrictions: text("geographic_restrictions"),
});

// Schemas
export const insertQueryHistorySchema = createInsertSchema(queryHistory).omit({
  id: true,
  timestamp: true,
});

export const insertAdSalesMetricsSchema = createInsertSchema(adSalesMetrics).omit({
  id: true,
});

export const insertTotalSalesMetricsSchema = createInsertSchema(totalSalesMetrics).omit({
  id: true,
});

export const insertEligibilityTableSchema = createInsertSchema(eligibilityTable).omit({
  id: true,
});

// Types
export type QueryHistory = typeof queryHistory.$inferSelect;
export type InsertQueryHistory = z.infer<typeof insertQueryHistorySchema>;
export type AdSalesMetrics = typeof adSalesMetrics.$inferSelect;
export type InsertAdSalesMetrics = z.infer<typeof insertAdSalesMetricsSchema>;
export type TotalSalesMetrics = typeof totalSalesMetrics.$inferSelect;
export type InsertTotalSalesMetrics = z.infer<typeof insertTotalSalesMetricsSchema>;
export type EligibilityTable = typeof eligibilityTable.$inferSelect;
export type InsertEligibilityTable = z.infer<typeof insertEligibilityTableSchema>;

// API Response Types
export interface QueryResponse {
  question: string;
  sql: string;
  result: string;
  answer: string;
  executionTime: number;
  tablesQueried: number;
  success: boolean;
  timestamp: string;
}

export interface AnalyticsData {
  barChart: { labels: string[]; data: number[] };
  lineChart: { labels: string[]; data: number[] };
  pieChart: { labels: string[]; data: number[] };
  scatterChart: { data: Array<{ x: number; y: number }> };
}

export interface SummaryData {
  totalRevenue: number;
  topProduct: string;
  averageRoas: number;
  growthRate: number;
  keyInsights: string[];
}
