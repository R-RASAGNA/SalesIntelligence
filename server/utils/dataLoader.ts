import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { storage } from '../storage';
import type { InsertAdSalesMetrics, InsertTotalSalesMetrics, InsertEligibilityTable } from '@shared/schema';

export class DataLoader {
  async loadAllData(): Promise<void> {
    try {
      await this.loadAdSalesData();
      await this.loadTotalSalesData();
      await this.loadEligibilityData();
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async loadAdSalesData(): Promise<void> {
    const filePath = path.join(process.cwd(), 'data', 'sample_ad_sales.csv');
    
    if (!fs.existsSync(filePath)) {
      console.warn('Ad sales data file not found, creating sample data');
      await this.createSampleAdSalesData();
      return;
    }

    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, { 
      columns: true, 
      skip_empty_lines: true,
      cast: true,
    });

    const adSalesMetrics: InsertAdSalesMetrics[] = records.map((record: any) => ({
      product_name: record.product_name || record.Product || '',
      campaign_name: record.campaign_name || record.Campaign || '',
      ad_spend: parseFloat(record.ad_spend || record['Ad Spend'] || 0),
      impressions: parseInt(record.impressions || record.Impressions || 0),
      clicks: parseInt(record.clicks || record.Clicks || 0),
      cpc: parseFloat(record.cpc || record.CPC || 0),
      ctr: parseFloat(record.ctr || record.CTR || 0),
      conversions: parseInt(record.conversions || record.Conversions || 0),
      conversion_rate: parseFloat(record.conversion_rate || record['Conversion Rate'] || 0),
      roas: parseFloat(record.roas || record.ROAS || 0),
    }));

    await storage.bulkInsertAdSalesMetrics(adSalesMetrics);
    console.log(`Loaded ${adSalesMetrics.length} ad sales records`);
  }

  private async loadTotalSalesData(): Promise<void> {
    const filePath = path.join(process.cwd(), 'data', 'sample_total_sales.csv');
    
    if (!fs.existsSync(filePath)) {
      console.warn('Total sales data file not found, creating sample data');
      await this.createSampleTotalSalesData();
      return;
    }

    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, { 
      columns: true, 
      skip_empty_lines: true,
      cast: true,
    });

    const totalSalesMetrics: InsertTotalSalesMetrics[] = records.map((record: any) => ({
      product_name: record.product_name || record.Product || '',
      category: record.category || record.Category || '',
      total_revenue: parseFloat(record.total_revenue || record['Total Revenue'] || 0),
      units_sold: parseInt(record.units_sold || record['Units Sold'] || 0),
      avg_order_value: parseFloat(record.avg_order_value || record['AOV'] || 0),
      profit_margin: parseFloat(record.profit_margin || record['Profit Margin'] || 0),
      customer_acquisition_cost: parseFloat(record.customer_acquisition_cost || record.CAC || 0),
    }));

    await storage.bulkInsertTotalSalesMetrics(totalSalesMetrics);
    console.log(`Loaded ${totalSalesMetrics.length} total sales records`);
  }

  private async loadEligibilityData(): Promise<void> {
    const filePath = path.join(process.cwd(), 'data', 'sample_eligibility.csv');
    
    if (!fs.existsSync(filePath)) {
      console.warn('Eligibility data file not found, creating sample data');
      await this.createSampleEligibilityData();
      return;
    }

    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, { 
      columns: true, 
      skip_empty_lines: true,
      cast: true,
    });

    const eligibilityEntries: InsertEligibilityTable[] = records.map((record: any) => ({
      product_name: record.product_name || record.Product || '',
      eligible_for_ads: record.eligible_for_ads === 'true' || record['Eligible for Ads'] === 'true',
      category_restrictions: record.category_restrictions || record['Category Restrictions'] || null,
      min_order_quantity: parseInt(record.min_order_quantity || record['Min Order Qty'] || 1),
      max_order_quantity: parseInt(record.max_order_quantity || record['Max Order Qty'] || 1000),
      geographic_restrictions: record.geographic_restrictions || record['Geographic Restrictions'] || null,
    }));

    await storage.bulkInsertEligibilityEntries(eligibilityEntries);
    console.log(`Loaded ${eligibilityEntries.length} eligibility records`);
  }

  private async createSampleAdSalesData(): Promise<void> {
    const sampleData: InsertAdSalesMetrics[] = [
      {
        product_name: 'Wireless Headphones Pro',
        campaign_name: 'Summer Sale 2024',
        ad_spend: 15000,
        impressions: 150000,
        clicks: 4500,
        cpc: 3.33,
        ctr: 3.0,
        conversions: 450,
        conversion_rate: 10.0,
        roas: 5.2,
      },
      {
        product_name: 'Smart Watch Series X',
        campaign_name: 'Tech Launch Campaign',
        ad_spend: 22000,
        impressions: 200000,
        clicks: 6000,
        cpc: 3.67,
        ctr: 3.0,
        conversions: 600,
        conversion_rate: 10.0,
        roas: 4.8,
      },
      {
        product_name: 'Gaming Laptop Ultra',
        campaign_name: 'Gaming Week Promo',
        ad_spend: 35000,
        impressions: 120000,
        clicks: 3600,
        cpc: 9.72,
        ctr: 3.0,
        conversions: 180,
        conversion_rate: 5.0,
        roas: 6.2,
      },
    ];

    await storage.bulkInsertAdSalesMetrics(sampleData);
    console.log('Created sample ad sales data');
  }

  private async createSampleTotalSalesData(): Promise<void> {
    const sampleData: InsertTotalSalesMetrics[] = [
      {
        product_name: 'Wireless Headphones Pro',
        category: 'Electronics',
        total_revenue: 750000,
        units_sold: 2500,
        avg_order_value: 300,
        profit_margin: 25.5,
        customer_acquisition_cost: 45,
      },
      {
        product_name: 'Smart Watch Series X',
        category: 'Wearables',
        total_revenue: 920000,
        units_sold: 2300,
        avg_order_value: 400,
        profit_margin: 30.2,
        customer_acquisition_cost: 52,
      },
      {
        product_name: 'Gaming Laptop Ultra',
        category: 'Computers',
        total_revenue: 1200000,
        units_sold: 800,
        avg_order_value: 1500,
        profit_margin: 22.8,
        customer_acquisition_cost: 180,
      },
    ];

    await storage.bulkInsertTotalSalesMetrics(sampleData);
    console.log('Created sample total sales data');
  }

  private async createSampleEligibilityData(): Promise<void> {
    const sampleData: InsertEligibilityTable[] = [
      {
        product_name: 'Wireless Headphones Pro',
        eligible_for_ads: true,
        category_restrictions: null,
        min_order_quantity: 1,
        max_order_quantity: 500,
        geographic_restrictions: null,
      },
      {
        product_name: 'Smart Watch Series X',
        eligible_for_ads: true,
        category_restrictions: null,
        min_order_quantity: 1,
        max_order_quantity: 300,
        geographic_restrictions: 'US, CA, EU',
      },
      {
        product_name: 'Gaming Laptop Ultra',
        eligible_for_ads: true,
        category_restrictions: 'Age 18+',
        min_order_quantity: 1,
        max_order_quantity: 100,
        geographic_restrictions: null,
      },
    ];

    await storage.bulkInsertEligibilityEntries(sampleData);
    console.log('Created sample eligibility data');
  }
}

export const dataLoader = new DataLoader();
