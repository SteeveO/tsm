import express from 'express';
import tsmRoutes from './tsm.route';

const router = express.Router();

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

// mount tsm routes at /tsm
router.use('/tsm', tsmRoutes);

export default router;
