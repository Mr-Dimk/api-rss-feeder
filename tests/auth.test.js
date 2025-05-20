import request from 'supertest';
import { app } from '../src/index.js';
import { expect } from 'chai';

// Increase timeout for async server/db startup
before(function () {
  this.timeout(5000);
  // Debug: Log before all tests
  // eslint-disable-next-line no-console
  console.log('Starting Auth API tests...');
});

describe('Auth API', () => {
  describe('POST /api/auth/token', () => {
    it('should generate a new API token', async () => {
      // Debug: Log before request
      // eslint-disable-next-line no-console
      console.log('Testing POST /api/auth/token');
      const res = await request(app).post('/api/auth/token');
      // Debug: Log after response
      // eslint-disable-next-line no-console
      console.log('Response:', res.status, res.body);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
    });
  });

  describe('PUT /api/auth/token', () => {
    it('should refresh a valid API token', async () => {
      // Debug: Log before request
      // eslint-disable-next-line no-console
      console.log('Testing PUT /api/auth/token (valid)');
      const tokenRes = await request(app).post('/api/auth/token');
      const oldToken = tokenRes.body.token;
      const res = await request(app)
        .put('/api/auth/token')
        .send({ token: oldToken });
      // Debug: Log after response
      // eslint-disable-next-line no-console
      console.log('Response:', res.status, res.body);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body.token).to.be.a('string');
      expect(res.body.token).to.not.equal(oldToken);
    });
    it('should return 400 for invalid token', async () => {
      // Debug: Log before request
      // eslint-disable-next-line no-console
      console.log('Testing PUT /api/auth/token (invalid)');
      const res = await request(app)
        .put('/api/auth/token')
        .send({ token: 'invalid' });
      // Debug: Log after response
      // eslint-disable-next-line no-console
      console.log('Response:', res.status, res.body);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('Ping API', () => {
    it('should respond to /api/ping', async () => {
      const res = await request(app).get('/api/ping');
      // eslint-disable-next-line no-console
      console.log('Ping response:', res.status, res.body);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'pong');
    });
  });
});
