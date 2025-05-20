import express from 'express';
import authRouter from './routes/auth.js';
import subscriptionsRouter from './routes/subscriptions.js';

const app = express();
app.use(express.json());

// Mount authentication routes
app.use('/api/auth', authRouter);
// Mount subscriptions routes
app.use('/api/subscriptions', subscriptionsRouter);

// Basic error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
