import express from 'express';

const router = express.Router();

// Placeholder auth route
router.get('/', (req, res) => {
  res.json({ message: 'Auth route (placeholder)' });
});

export default router;
