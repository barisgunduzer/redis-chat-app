import request from 'supertest';

describe('check api is up or not', () => {
  it('returns 200 if api is up', async () => {
    const res = await request(app).get(`/health`).expect(200);
    expect(res.body.uptime).toBeGreaterThan(0);
  });
});
