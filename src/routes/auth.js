import express from 'express';
import { generateToken, isValidToken, refreshToken } from '../models/user.js';
import logger from '../logger.js';

const router = express.Router();

// POST /api/auth/token – Generate new API token
router.post('/token', (req, res, next) => {
  try {
    const token = generateToken();
    logger.info('API token generated');
    res.status(201).json({ token });
  } catch (err) {
    logger.error('Failed to generate token', err);
    next(err);
  }
});

// PUT /api/auth/token – Refresh API token
router.put('/token', (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token || !isValidToken(token)) {
      logger.warn('Invalid or missing token for refresh');
      return res.status(400).json({ error: 'Invalid or missing token' });
    }
    const newToken = refreshToken();
    logger.info('API token refreshed');
    res.status(200).json({ token: newToken });
  } catch (err) {
    logger.error('Failed to refresh token', err);
    next(err);
  }
});

export default router;
