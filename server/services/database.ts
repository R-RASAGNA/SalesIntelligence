import { storage } from '../storage';
import { geminiService } from './gemini';
import type { QueryResponse } from '@shared/schema';

export class DatabaseService {
  async executeQuery(question: string): Promise<QueryResponse> {
    const startTime = Date.now();
    
    try {
      // Convert question to SQL using Gemini
      const sql = await geminiService.convertToSQL(question);
      
      // Execute the SQL query
      const queryResult = await storage.executeRawQuery(sql);
      
      // Generate human-readable answer
      const answer = await geminiService.generateSummary(queryResult, question);
      
      const executionTime = Date.now() - startTime;
      
      // Create response object
      const response: QueryResponse = {
        question,
        sql,
        result: JSON.stringify(queryResult),
        answer,
        executionTime,
        tablesQueried: this.countTablesInQuery(sql),
        success: true,
        timestamp: new Date().toISOString(),
      };

      // Store in history
      await storage.createQueryHistory({
        question,
        sql,
        result: JSON.stringify(queryResult),
      });

      return response;
    } catch (error) {
      console.error('Query execution error:', error);
      
      const response: QueryResponse = {
        question,
        sql: '',
        result: '',
        answer: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        executionTime: Date.now() - startTime,
        tablesQueried: 0,
        success: false,
        timestamp: new Date().toISOString(),
      };

      return response;
    }
  }

  private countTablesInQuery(sql: string): number {
    const tables = ['ad_sales_metrics', 'total_sales_metrics', 'eligibility_table'];
    const lowerSql = sql.toLowerCase();
    return tables.filter(table => lowerSql.includes(table)).length;
  }

  async getQueryHistory(limit: number = 10) {
    return await storage.getQueryHistory(limit);
  }

  async clearHistory() {
    await storage.clearQueryHistory();
  }

  async getDataStatus() {
    return await storage.getDataCounts();
  }
}

export const databaseService = new DatabaseService();
