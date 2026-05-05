const request = require('supertest');
const app = require('./server');

describe('URL Shortener API', () => {
  
  test('POST /api/shorten - should shorten a URL', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://example.com/very/long/url' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('shortCode');
    expect(response.body.success).toBe(true);
  });
  
  test('POST /api/shorten - should reject invalid URL', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'not-a-valid-url' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
  });
  
  test('GET /:shortCode - should redirect to long URL', async () => {
    const shortenResponse = await request(app)
      .post('/api/shorten')
      .send({ longUrl: 'https://example.com' });
    
    const shortCode = shortenResponse.body.shortCode;
    
    const redirectResponse = await request(app)
      .get(`/${shortCode}`);
    
    expect(redirectResponse.status).toBe(302);
  });
  
  test('GET /:shortCode - should 404 for unknown code', async () => {
    const response = await request(app)
      .get('/nonexistent');
    
    expect(response.status).toBe(404);
  });
});
