import express from 'express';
import { isValidToken } from '../models/user.js';
import { createWebhook, validateWebhook } from '../models/webhook.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const router = express.Router();

// Setup lowdb (moved to per-request async function)
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
async function getDb() {
  const db = new Low(new JSONFile(dbFile), { webhooks: [] });
  await db.read();
  db.data ||= { webhooks: [] };
  return db;
}

// Middleware: Require valid API token
router.use(async (req, res, next) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth || !isValidToken(auth.replace('Bearer ', ''))) {
      logger.warn('Unauthorized: Invalid or missing token');
      return res
        .status(401)
        .json({ error: 'Unauthorized: Invalid or missing token' });
    }
    next();
  } catch (err) {
    logger.error('Error in auth middleware', err);
    next(err);
  }
});

// POST /api/webhooks – Register webhook URL
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = validateWebhook(req.body);
    if (error) {
      logger.warn('Webhook validation failed', error.details[0]);
      return res.status(400).json({ error: error.details[0].message });
    }
    const db = await getDb();
    // Check for duplicate callbackUrl
    const exists = db.data.webhooks.some(
      (w) => w.callbackUrl === value.callbackUrl
    );
    if (exists) {
      logger.warn('Webhook already registered for this URL');
      return res
        .status(409)
        .json({ error: 'Webhook already registered for this URL' });
    }
    const webhook = createWebhook(value);
    db.data.webhooks.push(webhook);
    await db.write();
    logger.info('Webhook registered', { id: webhook.id });
    res.status(201).json({ webhook });
  } catch (err) {
    logger.error('Failed to register webhook', err);
    next(err);
  }
});

export default router;
