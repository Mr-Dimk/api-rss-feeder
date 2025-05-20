import fetch from 'node-fetch';
import { expect } from 'chai';

describe('Auth API (integration)', () => {
  it('should generate a new API token', async () => {
    const res = await fetch('http://localhost:3000/api/auth/token', { method: 'POST' });
    expect(res.status).to.equal(201);
    const body = await res.json();
    expect(body).to.have.property('token');
    expect(body.token).to.be.a('string');
  });

  it('should refresh a valid API token', async () => {
    const tokenRes = await fetch('http://localhost:3000/api/auth/token', { method: 'POST' });
    const { token: oldToken } = await tokenRes.json();
    const res = await fetch('http://localhost:3000/api/auth/token', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: oldToken }),
    });
    expect(res.status).to.equal(200);
    const body = await res.json();
    expect(body).to.have.property('token');
    expect(body.token).to.be.a('string');
    expect(body.token).to.not.equal(oldToken);
  });

  it('should return 400 for invalid token', async () => {
    const res = await fetch('http://localhost:3000/api/auth/token', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'invalid' }),
    });
    expect(res.status).to.equal(400);
    const body = await res.json();
    expect(body).to.have.property('error');
  });
});
