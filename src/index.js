import express from 'express';
import authRouter from './routes/auth.js';
import subscriptionsRouter from './routes/subscriptions.js';
import feedsRouter from './routes/feeds.js';
import webhooksRouter from './routes/webhooks.js';
import { startFeedPolling } from './services/feedPoller.js';
import { startWebhookDispatcher } from './services/webhookDispatcher.js';

const app = express();
app.use(express.json());

// Mount authentication routes
app.use('/api/auth', authRouter);
// Mount subscriptions routes
app.use('/api/subscriptions', subscriptionsRouter);
// Mount feeds routes
app.use('/api/feeds', feedsRouter);
// Mount webhooks routes
app.use('/api/webhooks', webhooksRouter);

// Basic error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startFeedPolling();
  startWebhookDispatcher();
});
