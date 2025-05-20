import express from 'express';
import authRouter from './routes/auth.js';
import subscriptionsRouter from './routes/subscriptions.js';
import feedsRouter from './routes/feeds.js';
import webhooksRouter from './routes/webhooks.js';
import { startFeedPolling } from './services/feedPoller.js';
import { startWebhookDispatcher } from './services/webhookDispatcher.js';
import logger from './logger.js';

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

// Health check route for test diagnostics
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// Basic error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// Only start background services and listen if not in test mode
export function startServer() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startFeedPolling();
    startWebhookDispatcher();
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
