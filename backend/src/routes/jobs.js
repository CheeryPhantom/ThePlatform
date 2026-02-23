import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q = '', limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit) || 20, 100);
    const search = `%${q.toLowerCase()}%`;

    const query = `
      SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.employment_type,
        j.salary_range,
        j.posted_at,
        e.company_name
      FROM jobs j
      INNER JOIN employers e ON e.id = j.employer_id
      WHERE j.active = TRUE
        AND (LOWER(j.title) LIKE $1 OR LOWER(COALESCE(j.description, '')) LIKE $1)
      ORDER BY j.posted_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [search, safeLimit]);
    res.json({ jobs: result.rows });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
