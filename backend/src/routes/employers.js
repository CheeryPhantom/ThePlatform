import express from 'express';

const router = express.Router();

// Placeholder employers route
router.get('/', (req, res) => {
  res.json({ message: 'Employers route (placeholder)' });
});

export default router;
