import request from 'supertest';
import { app } from './minimalApp.js';

(async () => {
  try {
    const res = await request(app).get('/api/ping');
    console.log('Manual test response:', res.status, res.body);
    if (res.status === 200 && res.body.message === 'pong') {
      console.log('✅ Test passed: /api/ping responded correctly');
      process.exit(0);
    } else {
      console.error(
        '❌ Test failed: Unexpected response',
        res.status,
        res.body
      );
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
})();
