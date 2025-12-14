import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all bounties
  app.get("/api/bounties", async (req, res) => {
    try {
      const bounties = await storage.getAllBounties();
      res.json(bounties);
    } catch (error) {
      console.error("Error fetching bounties:", error);
      res.status(500).json({ error: "Failed to fetch bounties" });
    }
  });

  // Get active bounties
  app.get("/api/bounties/active", async (req, res) => {
    try {
      const bounties = await storage.getActiveBounties();
      res.json(bounties);
    } catch (error) {
      console.error("Error fetching active bounties:", error);
      res.status(500).json({ error: "Failed to fetch active bounties" });
    }
  });

  // Get claimed bounties
  app.get("/api/bounties/claimed", async (req, res) => {
    try {
      const bounties = await storage.getClaimedBounties();
      res.json(bounties);
    } catch (error) {
      console.error("Error fetching claimed bounties:", error);
      res.status(500).json({ error: "Failed to fetch claimed bounties" });
    }
  });

  // Get single bounty
  app.get("/api/bounties/:id", async (req, res) => {
    try {
      const bounty = await storage.getBounty(req.params.id);
      if (!bounty) {
        return res.status(404).json({ error: "Bounty not found" });
      }
      res.json(bounty);
    } catch (error) {
      console.error("Error fetching bounty:", error);
      res.status(500).json({ error: "Failed to fetch bounty" });
    }
  });

  // Get bot status
  app.get("/api/bot/status", (req, res) => {
    const hasToken = !!(process.env.BOT_TOKEN || process.env.DISCORD_BOT_TOKEN);
    res.json({
      configured: hasToken,
      status: hasToken ? "running" : "not_configured",
    });
  });

  return httpServer;
}
