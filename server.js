import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const DATA_PATH = path.join(DATA_DIR, "leaderboard.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "[]", "utf-8");

function readLeaderboard() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(entries) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

// Index
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Static
app.use(express.static(path.join(__dirname, "public")));

// Get leaderboard
app.get("/api/leaderboard", (req, res) => {
  const entries = readLeaderboard();

  // Sort: total desc, then createdAt asc
  entries.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return (a.createdAt ?? 0) - (b.createdAt ?? 0);
  });

  res.json({ ok: true, entries: entries.slice(0, 100) });
});

// Post score
app.post("/api/score", (req, res) => {
  const { princessName, stats, total, status, endedAtTurn } = req.body ?? {};

  if (typeof princessName !== "string" || princessName.trim().length < 1) {
    return res.status(400).json({ ok: false, error: "princessName is required." });
  }
  const cleanName = princessName.trim().slice(0, 20);

  const requiredKeys = ["hp", "money", "charm", "intel", "social"];
  const validStats =
    stats &&
    typeof stats === "object" &&
    requiredKeys.every((k) => typeof stats[k] === "number" && Number.isFinite(stats[k]));

  if (!validStats || typeof total !== "number" || !Number.isFinite(total)) {
    return res.status(400).json({ ok: false, error: "stats/total are invalid." });
  }

  const cleanStatus = status === "GAME_OVER" ? "GAME_OVER" : "COMPLETED";
  const cleanEndedTurn =
    typeof endedAtTurn === "number" && Number.isFinite(endedAtTurn) ? Math.max(1, Math.min(20, endedAtTurn)) : 20;

  const entry = {
    id: Math.random().toString(16).slice(2) + Date.now().toString(16),
    princessName: cleanName,
    stats,
    total,
    status: cleanStatus,       // "COMPLETED" | "GAME_OVER"
    endedAtTurn: cleanEndedTurn, // 1..20
    createdAt: Date.now()
  };

  const entries = readLeaderboard();
  entries.push(entry);
  writeLeaderboard(entries.slice(-500));

  res.json({ ok: true, entry });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
