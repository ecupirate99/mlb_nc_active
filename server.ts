import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache for players data
  let playersCache: any = null;
  let lastCacheUpdate = 0;
  const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  app.get("/api/players/nc-hitters", async (req, res) => {
    try {
      const now = Date.now();
      if (playersCache && now - lastCacheUpdate < CACHE_DURATION) {
        return res.json(playersCache);
      }

      console.log("Fetching MLB players...");
      // 1. Fetch all active players (default season is current)
      // To get more, we could potentially fetch multiple seasons, but for performance we'll start with active.
      const playersResponse = await fetch("https://statsapi.mlb.com/api/v1/sports/1/players");
      const playersData = await playersResponse.json();

      // 2. Filter for players born in NC and not pitchers
      const ncHitters = playersData.people.filter((p: any) => 
        p.birthStateProvince === "NC" && 
        p.primaryPosition?.type !== "Pitcher"
      );

      console.log(`Found ${ncHitters.length} NC hitters. Fetching career stats...`);

      // 3. Fetch career stats for each hitter in parallel with a concurrency limit
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

      // Filter out those with no stats if they never actually played or data is missing
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
