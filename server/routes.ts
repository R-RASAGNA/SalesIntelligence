import type { Express } from "express";
import { createServer, type Server } from "http";
import { databaseService } from "./services/database";
import { analyticsService } from "./services/analytics";
import { dataLoader } from "./utils/dataLoader";
import { insertQueryHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Load data on startup
  await dataLoader.loadAllData();

  // Query endpoint
  app.post("/api/query", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }

      const result = await databaseService.executeQuery(question);
      res.json(result);
    } catch (error) {
      console.error('Query error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await analyticsService.generateAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to generate analytics' });
    }
  });

  // Summary endpoint
  app.get("/api/summary", async (req, res) => {
    try {
      const summary = await analyticsService.generateSummary();
      res.json(summary);
    } catch (error) {
      console.error('Summary error:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // History endpoints
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await databaseService.getQueryHistory(limit);
      res.json(history);
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({ error: 'Failed to get history' });
    }
  });

  app.delete("/api/history", async (req, res) => {
    try {
      await databaseService.clearHistory();
      res.json({ success: true });
    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({ error: 'Failed to clear history' });
    }
  });

  // Data status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const status = await databaseService.getDataStatus();
      res.json(status);
    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({ error: 'Failed to get data status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
