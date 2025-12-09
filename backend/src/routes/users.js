import express from 'express';

const router = express.Router();

// Placeholder users route
router.get('/', (req, res) => {
  res.json({ message: 'Users route (placeholder)' });
});

export default router;
