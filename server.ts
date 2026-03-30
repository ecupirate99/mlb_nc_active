import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Cache for players data
let playersCache: any = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export async function createApp() {
  const app = express();

  app.get("/api/players/nc-hitters", async (req, res) => {
    try {
      const now = Date.now();
      if (playersCache && now - lastCacheUpdate < CACHE_DURATION) {
        return res.json(playersCache);
      }

      console.log("Fetching MLB players...");
      const playersResponse = await fetch("https://statsapi.mlb.com/api/v1/sports/1/players");
      const playersData = await playersResponse.json();

      const ncHitters = playersData.people.filter((p: any) => 
        p.birthStateProvince === "NC" && 
        p.primaryPosition?.type !== "Pitcher"
      );

      console.log(`Found ${ncHitters.length} NC hitters. Fetching career stats...`);

      const hittersWithStats = await Promise.all(
        ncHitters.map(async (player: any) => {
          try {
            const statsResponse = await fetch(
              `https://statsapi.mlb.com/api/v1/people/${player.id}/stats?stats=career&group=hitting`
            );
            const statsData = await statsResponse.json();
            const careerStats = statsData.stats?.[0]?.splits?.[0]?.stat || null;
            
            return {
              id: player.id,
              fullName: player.fullName,
              birthCity: player.birthCity,
              birthDate: player.birthDate,
              height: player.height,
              weight: player.weight,
              batSide: player.batSide?.description,
              pitchHand: player.pitchHand?.description,
              primaryPosition: player.primaryPosition?.name,
              stats: careerStats
            };
          } catch (err) {
            console.error(`Error fetching stats for ${player.fullName}:`, err);
            return { ...player, stats: null };
          }
        })
      );

      const result = hittersWithStats.filter(p => p.stats !== null);
      playersCache = result;
      lastCacheUpdate = now;
      res.json(result);
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Failed to fetch MLB data" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Note: In serverless environments, this part might be handled by the platform's static routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server.ts')) {
  const PORT = 3000;
  createApp().then(app => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
