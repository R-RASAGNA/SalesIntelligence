import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async convertToSQL(question: string): Promise<string> {
    const prompt = `
You are an expert SQL query generator. Convert the following natural language question into a SQL query.

Available tables and their schemas:
1. ad_sales_metrics: product_name, campaign_name, ad_spend, impressions, clicks, cpc, ctr, conversions, conversion_rate, roas
2. total_sales_metrics: product_name, category, total_revenue, units_sold, avg_order_value, profit_margin, customer_acquisition_cost
3. eligibility_table: product_name, eligible_for_ads, category_restrictions, min_order_quantity, max_order_quantity, geographic_restrictions

Question: "${question}"

Rules:
- Generate only valid SQL SELECT statements
- Use proper table and column names
- Include appropriate WHERE, GROUP BY, ORDER BY clauses as needed
- For aggregations, use SUM, COUNT, AVG as appropriate
- Limit results to reasonable numbers (use LIMIT clause)
- Return only the SQL query, no explanations

SQL Query:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const sqlQuery = response.text().trim();
      
      // Clean up the response to extract just the SQL
      const cleanedSQL = this.cleanSQLResponse(sqlQuery);
      return cleanedSQL;
    } catch (error) {
      console.error('Error generating SQL:', error);
      throw new Error('Failed to convert question to SQL');
    }
  }

  async generateSummary(data: any[], question: string): Promise<string> {
    const prompt = `
You are a business analytics expert. Based on the following data and question, provide a clear, concise summary in natural language.

Question: "${question}"
Data: ${JSON.stringify(data.slice(0, 10))} ${data.length > 10 ? `... and ${data.length - 10} more rows` : ''}

Provide a business-friendly answer that:
- Directly answers the question
- Highlights key insights
- Uses proper formatting with numbers
- Keeps it concise but informative
- Uses business terminology

Summary:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Unable to generate summary at this time.';
    }
  }

  async generateInsights(adSalesData: any[], totalSalesData: any[], eligibilityData: any[]): Promise<string[]> {
    const prompt = `
You are a business intelligence analyst. Based on the following e-commerce data, provide 4-5 key business insights.

Ad Sales Data (sample): ${JSON.stringify(adSalesData.slice(0, 5))}
Total Sales Data (sample): ${JSON.stringify(totalSalesData.slice(0, 5))}
Eligibility Data (sample): ${JSON.stringify(eligibilityData.slice(0, 5))}

Provide insights as a JSON array of strings, focusing on:
- Revenue performance
- Ad spend efficiency
- Product performance
- Growth opportunities
- Risk factors

Format: ["Insight 1", "Insight 2", "Insight 3", "Insight 4", "Insight 5"]

Insights:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Try to parse as JSON, fallback to manual parsing
      try {
        return JSON.parse(text);
      } catch {
        // Extract insights manually if JSON parsing fails
        const insights = text.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
        return insights;
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      return [
        'Unable to generate insights at this time.',
        'Please try again later.',
      ];
    }
  }

  private cleanSQLResponse(sqlResponse: string): string {
    // Remove any markdown formatting
    let cleaned = sqlResponse.replace(/```sql/gi, '').replace(/```/g, '');
    
    // Remove any extra explanations or text
    const lines = cleaned.split('\n').filter(line => line.trim());
    const sqlLines = lines.filter(line => {
      const trimmed = line.trim().toLowerCase();
      return trimmed.startsWith('select') || 
             trimmed.startsWith('from') ||
             trimmed.startsWith('where') ||
             trimmed.startsWith('group by') ||
             trimmed.startsWith('order by') ||
             trimmed.startsWith('limit') ||
             trimmed.startsWith('and') ||
             trimmed.startsWith('or') ||
             (trimmed.includes('select') && trimmed.includes('from'));
    });
    
    return sqlLines.join(' ').trim();
  }
}

export const geminiService = new GeminiService();