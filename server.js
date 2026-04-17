const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup — use /data dir on Render (persistent disk), fallback to local
const DB_DIR = process.env.RENDER ? '/data' : path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, 'assessments.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    name TEXT,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create new assessment
app.post('/api/assessment', (req, res) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const { name = '', data = {} } = req.body;

  db.prepare(`
    INSERT INTO assessments (id, name, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, JSON.stringify(data), now, now);

  res.json({ id, name, data, created_at: now, updated_at: now });
});

// Get assessment by ID
app.get('/api/assessment/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, data: JSON.parse(row.data) });
});

// Update assessment
app.put('/api/assessment/:id', (req, res) => {
  const { name, data } = req.body;
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE assessments SET name = ?, data = ?, updated_at = ? WHERE id = ?
  `).run(name ?? existing.name, JSON.stringify(data), now, req.params.id);

  res.json({ id: req.params.id, name, data, updated_at: now });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Vertical Upskilling running on port ${PORT}`));
