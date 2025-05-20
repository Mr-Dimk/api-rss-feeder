import { Low, JSONFile } from 'lowdb';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFeedItem } from '../models/feedItem.js';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
const db = new Low(new JSONFile(dbFile));

// Helper: Get last poll time for a subscription
function getLastPollTime(subscriptionId, db) {
  db.data.lastPolls ||= {};
  return db.data.lastPolls[subscriptionId] || 0;
}

// Helper: Set last poll time
function setLastPollTime(subscriptionId, time, db) {
  db.data.lastPolls ||= {};
  db.data.lastPolls[subscriptionId] = time;
}

// Poll all feeds according to their frequency
export async function startFeedPolling({ intervalMs = 60000 } = {}) {
  setInterval(async () => {
    await db.read();
    db.data.subscriptions ||= [];
    db.data.feedItems ||= [];
    for (const sub of db.data.subscriptions) {
      const now = Date.now();
      const lastPoll = getLastPollTime(sub.id, db);
      if (now - lastPoll < sub.frequency * 60000) continue;
      try {
        const res = await fetch(sub.feedUrl, { timeout: 10000 });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        const parsed = await parseStringPromise(xml, { explicitArray: false });
        const items = parsed.rss?.channel?.item || [];
        const newItems = Array.isArray(items) ? items : [items];
        for (const item of newItems) {
          const guid = item.guid?._ || item.guid || item.link || uuidv4();
          const exists = db.data.feedItems.some(f => f.guid === guid && f.subscriptionId === sub.id);
          if (!exists) {
            const feedItem = createFeedItem({
              content: item.title + '\n' + (item.description || ''),
              pubDate: item.pubDate || new Date().toISOString(),
              subscriptionId: sub.id,
            });
            feedItem.guid = guid;
            db.data.feedItems.push(feedItem);
          }
        }
        setLastPollTime(sub.id, now, db);
      } catch (err) {
        // Could add logging here
      }
    }
    await db.write();
  }, intervalMs);
}
