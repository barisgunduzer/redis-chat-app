import express from 'express';

const router = express.Router();

/**
 * @openapi
 *  /health:
 *  get:
 *     name: Check status
 *     summary: Check status
 *     responses:
 *       200:
 *         description: API is running
 */

router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
  };

  res.status(200).send(healthCheck);
});

export default router;
