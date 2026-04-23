import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { listCatalog, listMine, submit, remove } from '../controllers/certificationsController.js';
import { listMine as listMyBadges } from '../controllers/badgesController.js';

const router = express.Router();

// Catalog is public so unauthenticated visitors can browse free certs.
router.get('/catalog', listCatalog);

router.use(authenticate);
router.get('/mine', listMine);
router.post('/mine', submit);
router.delete('/mine/:id', remove);
router.get('/badges', listMyBadges);

export default router;
