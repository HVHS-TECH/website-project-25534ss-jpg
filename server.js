const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Admin password (never exposed to frontend)
const ADMIN_PASSWORD = "admin6767";

// In-memory token store for simplicity
let validTokens = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve static files (CSS, JS, images)

// Path to data file
const DATA_FILE = "data.json";

// =============================
// DATA HANDLING
// =============================
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ items: [], history: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// =============================
// ROUTES FOR FRONTEND PAGES
// =============================
// Main user page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Admin login page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// =============================
// AUTH
// =============================
app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    // Generate simple token
    const token = Date.now().toString();
    validTokens.push(token);
    res.json({ token });
  } else {
    res.status(403).json({ error: "Wrong password" });
  }
});

function verifyToken(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || !validTokens.includes(token)) {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

// =============================
// ITEMS ROUTES
// =============================
app.get("/items", (req, res) => {
  res.json(loadData().items);
});

app.post("/items", verifyToken, (req, res) => {
  const data = loadData();
  const newItem = {
    id: Date.now(),
    title: req.body.title,
    location: req.body.location,
    description: req.body.description,
  };
  data.items.push(newItem);
  saveData(data);
  res.status(201).json(newItem);
});

app.put("/items/:id", verifyToken, (req, res) => {
  const data = loadData();
  const id = parseInt(req.params.id);
  const item = data.items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  item.title = req.body.title;
  item.location = req.body.location;
  item.description = req.body.description;
  saveData(data);
  res.json(item);
});

app.delete("/items/:id", verifyToken, (req, res) => {
  const data = loadData();
  const id = parseInt(req.params.id);
  data.items = data.items.filter(i => i.id !== id);
  saveData(data);
  res.status(204).end();
});

// =============================
// HISTORY ROUTES
// =============================
app.get("/history", (req, res) => {
  res.json(loadData().history);
});

app.post("/history", verifyToken, (req, res) => {
  const data = loadData();
  const entry = {
    id: Date.now(),
    itemId: req.body.itemId,
    name: req.body.name,
    date: req.body.date,
    notes: req.body.notes,
  };
  data.history.push(entry);
  saveData(data);
  res.status(201).json(entry);
});

app.delete("/history/:id", verifyToken, (req, res) => {
  const data = loadData();
  const id = parseInt(req.params.id);
  data.history = data.history.filter(h => h.id !== id);
  saveData(data);
  res.status(204).end();
});

// =============================
// START SERVER
// =============================
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
app.get("/stats", (req, res) => {
  const data = loadData();

  const totalItems = data.items.length + data.history.length;
  const availableItems = data.items.length;
  const collectedItems = data.history.length;

  res.json({
    totalItems,
    availableItems,
    collectedItems
  });
});