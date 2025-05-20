import request from 'supertest';
import { app } from './minimalApp.js';
import { expect } from 'chai';

describe('Minimal App', () => {
  it('should respond to /api/ping', async () => {
    const res = await request(app).get('/api/ping');
    // eslint-disable-next-line no-console
    console.log('MinimalApp Ping response:', res.status, res.body);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'pong');
  });
});
