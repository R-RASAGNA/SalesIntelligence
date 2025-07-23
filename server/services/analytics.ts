import { storage } from '../storage';
import type { AnalyticsData, SummaryData } from '@shared/schema';
import { geminiService } from './gemini';

export class AnalyticsService {
  async generateAnalytics(): Promise<AnalyticsData> {
    try {
      const [adSalesData, totalSalesData] = await Promise.all([
        storage.getAdSalesMetrics(),
        storage.getTotalSalesMetrics(),
      ]);

      // Bar Chart: Revenue by Product (Top 10)
      const revenueByProduct = totalSalesData
        .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
        .slice(0, 10);
      
      const barChart = {
        labels: revenueByProduct.map(item => item.product_name || 'Unknown'),
        data: revenueByProduct.map(item => item.total_revenue || 0),
      };

      // Line Chart: Ad Spend Trend (simplified - using ad spend by product as trend)
      const adSpendData = adSalesData
        .sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''))
        .slice(0, 12);
      
      const lineChart = {
        labels: adSpendData.map(item => item.product_name || 'Unknown'),
        data: adSpendData.map(item => item.ad_spend || 0),
      };

      // Pie Chart: Market Share by Category
      const categoryRevenue = new Map<string, number>();
      totalSalesData.forEach(item => {
        const category = item.category || 'Other';
        const revenue = item.total_revenue || 0;
        categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + revenue);
      });
      
      const pieChart = {
        labels: Array.from(categoryRevenue.keys()).slice(0, 8),
        data: Array.from(categoryRevenue.values()).slice(0, 8),
      };

      // Scatter Chart: Ad Spend vs Revenue
      const scatterData: Array<{ x: number; y: number }> = [];
      for (const adItem of adSalesData.slice(0, 20)) {
        const salesItem = totalSalesData.find(s => s.product_name === adItem.product_name);
        if (salesItem && adItem.ad_spend && salesItem.total_revenue) {
          scatterData.push({
            x: adItem.ad_spend,
            y: salesItem.total_revenue,
          });
        }
      }
      
      const scatterChart = { data: scatterData };

      return { barChart, lineChart, pieChart, scatterChart };
    } catch (error) {
      console.error('Error generating analytics:', error);
      // Return empty charts on error
      return {
        barChart: { labels: [], data: [] },
        lineChart: { labels: [], data: [] },
        pieChart: { labels: [], data: [] },
        scatterChart: { data: [] },
      };
    }
  }

  async generateSummary(): Promise<SummaryData> {
    try {
      const [adSalesData, totalSalesData, eligibilityData] = await Promise.all([
        storage.getAdSalesMetrics(),
        storage.getTotalSalesMetrics(),
        storage.getEligibilityTable(),
      ]);

      // Calculate metrics
      const totalRevenue = totalSalesData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
      
      const topProduct = totalSalesData
        .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))[0]?.product_name || 'N/A';
      
      const validRoas = adSalesData.filter(item => item.roas && item.roas > 0);
      const averageRoas = validRoas.length > 0 
        ? validRoas.reduce((sum, item) => sum + (item.roas || 0), 0) / validRoas.length
        : 0;

      // Generate insights using Gemini
      const keyInsights = await geminiService.generateInsights(
        adSalesData,
        totalSalesData,
        eligibilityData
      );

      return {
        totalRevenue,
        topProduct,
        averageRoas,
        growthRate: 15, // Placeholder - in real app would calculate from historical data
        keyInsights,
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        totalRevenue: 0,
        topProduct: 'N/A',
        averageRoas: 0,
        growthRate: 0,
        keyInsights: ['Unable to generate insights at this time.'],
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
