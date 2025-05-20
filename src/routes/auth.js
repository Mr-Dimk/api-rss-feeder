import express from 'express';
import { generateToken, isValidToken, refreshToken } from '../models/user.js';

const router = express.Router();

// POST /api/auth/token – Generate new API token
router.post('/token', (req, res) => {
  try {
    const token = generateToken();
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// PUT /api/auth/token – Refresh API token
router.put('/token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token || !isValidToken(token)) {
      return res.status(400).json({ error: 'Invalid or missing token' });
    }
    const newToken = refreshToken();
    res.status(200).json({ token: newToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
