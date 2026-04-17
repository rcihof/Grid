const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Use /data if it already exists (Render persistent disk mounted), otherwise use local ./data
const DB_DIR = fs.existsSync('/data') ? '/data' : path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'assessments.json');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}));

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return {}; }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create
app.post('/api/assessment', (req, res) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const { name = '', data = {} } = req.body;
  const db = readDB();
  db[id] = { id, name, data, created_at: now, updated_at: now };
  writeDB(db);
  res.json(db[id]);
});

// Read
app.get('/api/assessment/:id', (req, res) => {
  const db = readDB();
  const row = db[req.params.id];
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Update
app.put('/api/assessment/:id', (req, res) => {
  const db = readDB();
  const existing = db[req.params.id];
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const { name, data } = req.body;
  db[req.params.id] = { ...existing, name: name ?? existing.name, data, updated_at: now };
  writeDB(db);
  res.json(db[req.params.id]);
});

// Catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Vertical Upskilling running on port ${PORT}`));
