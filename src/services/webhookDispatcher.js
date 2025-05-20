import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fetch from 'node-fetch';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');

const MAX_RETRIES = 5;
const INITIAL_DELAY = 2000; // ms

async function deliverWebhook(webhook, feedItem, attempt = 1) {
  try {
    const res = await fetch(webhook.callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedItem),
      timeout: 10000,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    logger.info('Webhook delivered', {
      webhookId: webhook.id,
      feedItemId: feedItem.id,
    });
  } catch (err) {
    logger.warn('Webhook delivery failed', {
      webhookId: webhook.id,
      feedItemId: feedItem.id,
      attempt,
      error: err.message,
    });
    if (attempt < MAX_RETRIES) {
      setTimeout(
        () => deliverWebhook(webhook, feedItem, attempt + 1),
        INITIAL_DELAY * Math.pow(2, attempt - 1)
      );
    } else {
      logger.error('Webhook delivery permanently failed', {
        webhookId: webhook.id,
        feedItemId: feedItem.id,
      });
    }
  }
}

function getDb() {
  return new Low(new JSONFile(dbFile), {
    webhooks: [],
    feedItems: [],
    delivered: {},
  });
}

export async function startWebhookDispatcher({ intervalMs = 15000 } = {}) {
  setInterval(async () => {
    const db = getDb();
    await db.read();
    db.data.webhooks ||= [];
    db.data.feedItems ||= [];
    db.data.delivered ||= {};
    for (const webhook of db.data.webhooks) {
      for (const subId of webhook.subscriptionIds) {
        const items = db.data.feedItems.filter(
          (item) => item.subscriptionId === subId
        );
        for (const item of items) {
          const deliveredKey = `${webhook.id}:${item.id}`;
          if (!db.data.delivered[deliveredKey]) {
            deliverWebhook(webhook, item);
            db.data.delivered[deliveredKey] = true;
          }
        }
      }
    }
    await db.write();
  }, intervalMs);
}
