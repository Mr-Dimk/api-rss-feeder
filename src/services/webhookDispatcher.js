import { Low, JSONFile } from 'lowdb';
import fetch from 'node-fetch';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
const db = new Low(new JSONFile(dbFile));

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
    // Optionally log success
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      setTimeout(() => deliverWebhook(webhook, feedItem, attempt + 1), INITIAL_DELAY * Math.pow(2, attempt - 1));
    } else {
      // Optionally log failure
    }
  }
}

export async function startWebhookDispatcher({ intervalMs = 15000 } = {}) {
  setInterval(async () => {
    await db.read();
    db.data.webhooks ||= [];
    db.data.feedItems ||= [];
    db.data.delivered ||= {};
    for (const webhook of db.data.webhooks) {
      for (const subId of webhook.subscriptionIds) {
        const items = db.data.feedItems.filter(item => item.subscriptionId === subId);
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
