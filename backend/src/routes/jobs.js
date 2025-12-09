import express from 'express';

const router = express.Router();

// Placeholder jobs route
router.get('/', (req, res) => {
  res.json({ message: 'Jobs route (placeholder)' });
});

export default router;
