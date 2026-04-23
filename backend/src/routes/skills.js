import express from 'express';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'skills-taxonomy.json');
const taxonomy = JSON.parse(readFileSync(dataPath, 'utf-8'));

const flat = taxonomy.categories.flatMap((c) =>
  c.skills.map((name) => ({
    name,
    category: c.key,
    category_label: c.label,
    norm: name.toLowerCase()
  }))
);

const knownSet = new Set(flat.map((s) => s.norm));

const router = express.Router();

router.get('/taxonomy', (_req, res) => {
  res.json({ categories: taxonomy.categories });
});

router.get('/search', (req, res) => {
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  if (!q) {
    return res.json({ results: flat.slice(0, limit) });
  }
  const starts = [];
  const contains = [];
  for (const s of flat) {
    if (s.norm.startsWith(q)) starts.push(s);
    else if (s.norm.includes(q)) contains.push(s);
    if (starts.length >= limit) break;
  }
  res.json({ results: [...starts, ...contains].slice(0, limit) });
});

export const isKnownSkill = (name) => {
  if (typeof name !== 'string') return false;
  return knownSet.has(name.trim().toLowerCase());
};

export default router;
