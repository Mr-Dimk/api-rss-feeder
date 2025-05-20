import express from 'express';
import { Low, JSONFile } from 'lowdb';
import { isValidToken } from '../models/user.js';
import { createWebhook, validateWebhook } from '../models/webhook.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
const db = new Low(new JSONFile(dbFile));

// Middleware: Require valid API token
router.use(async (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !isValidToken(auth.replace('Bearer ', ''))) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  await db.read();
  db.data ||= { webhooks: [] };
  next();
});

// POST /api/webhooks – Register webhook URL
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateWebhook(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // Check for duplicate callbackUrl
    const exists = db.data.webhooks.some(w => w.callbackUrl === value.callbackUrl);
    if (exists) {
      return res.status(409).json({ error: 'Webhook already registered for this URL' });
    }
    const webhook = createWebhook(value);
    db.data.webhooks.push(webhook);
    await db.write();
    res.status(201).json({ webhook });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register webhook' });
  }
});

export default router;
