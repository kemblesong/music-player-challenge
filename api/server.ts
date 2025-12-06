import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load data files
const playlist = JSON.parse(
  readFileSync(join(__dirname, "data", "playlist.json"), "utf-8"),
);
const allSongs = JSON.parse(
  readFileSync(join(__dirname, "data", "songs-10000.json"), "utf-8"),
);

const app = new Hono();

// Enable CORS for development
app.use("/*", cors());

// Simulate network latency (300ms)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

app.get("/", async (c) => {
  return c.text(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║        ♪ ♫  MUSIC PLAYER CHALLENGE  ♫ ♪           ║
  ║                                                   ║
  ║              ┌───────────────┐                    ║
  ║              │    ►  ▌▌  ■   │                    ║
  ║              │    ◄◄    ►►   │                    ║
  ║              └───────────────┘                    ║
  ║                   API v1.0                        ║
  ║                                                   ║
  ╠═══════════════════════════════════════════════════╣
  ║                                                   ║
  ║   ENDPOINTS                                       ║
  ║   ─────────                                       ║
  ║                                                   ║
  ║   GET /playlists/1    Fetch playlist #1           ║
  ║   GET /songs          All 10,000 songs            ║
  ║   GET /songs/:id      Single song by ID           ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
`);
});

// GET /playlists/:id - Returns a playlist with its songs
app.get("/playlists/:id", async (c) => {
  await delay(300);

  const id = c.req.param("id");

  if (id === "1") {
    return c.json(playlist);
  }

  return c.json({ error: "Playlist not found" }, 404);
});

// GET /songs - Returns all 10,000 songs (for Part 2: Virtual Scrolling)
app.get("/songs", async (c) => {
  await delay(300);
  return c.json(allSongs);
});

// GET /songs/:id - Returns a single song
app.get("/songs/:id", async (c) => {
  await delay(100);

  const id = c.req.param("id");
  const song = allSongs.find((s: { id: string }) => s.id === id);

  if (song) {
    return c.json(song);
  }

  return c.json({ error: "Song not found" }, 404);
});

const port = 3001;
console.log(`🎵 Music Player API running at http://localhost:${port}`);
console.log(`\nEndpoints:`);
console.log(`  GET /playlists/1  - Playlist with 20 songs`);
console.log(`  GET /songs        - All 10,000 songs (sorted A-Z)`);
console.log(`  GET /songs/:id    - Single song by ID`);

serve({
  fetch: app.fetch,
  port,
});
