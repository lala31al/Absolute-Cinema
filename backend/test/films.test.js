const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('3. Film Endpoints', () => {
    const tmdbId = 27205;

    afterAll(async () => {
        await db.query("DELETE FROM films WHERE tmdb_id = ?", [tmdbId]);
    });

    test('GET /api/films/search - Search film ke TMDB', async () => {
        const res = await request(app).get('/api/films/search?q=Inception');
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('tmdb_id');
    });

    test('POST /api/films - Simpan Film ke DB Lokal', async () => {
        const res = await request(app)
            .post('/api/films')
            .send({ tmdb_id: tmdbId });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('film_id');
    });

    test('GET /api/films/home - Ambil data Home', async () => {
        const res = await request(app).get('/api/films/home');
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    }, 15000);
});