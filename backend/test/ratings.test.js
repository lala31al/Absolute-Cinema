const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('5. Rating Endpoints', () => {
    let token;
    let localFilmId;

    const user = { username: 'rate_user', email: 'rate@test.com', password: '123' };
    const tmdbId = 157336;

    beforeAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
        await db.query("DELETE FROM films WHERE tmdb_id = ?", [tmdbId]);

        await request(app).post('/api/auth/register').send(user);
        const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
        token = login.body.token;

        const filmRes = await request(app).post('/api/films').send({ tmdb_id: tmdbId });
        localFilmId = filmRes.body.film_id;
    });

    afterAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
        await db.query("DELETE FROM films WHERE tmdb_id = ?", [tmdbId]);
    });

    test('POST /api/ratings - Beri Rating 10', async () => {
        const res = await request(app)
            .post('/api/ratings')
            .set('Authorization', `Bearer ${token}`)
            .send({ 
                film_id: localFilmId, 
                rating: 10 
            });

        expect(res.statusCode).toBe(200);
    });

    test('GET /api/ratings/film/:tmdb_id - Cek Rating Rata-rata', async () => {
        const res = await request(app).get(`/api/ratings/film/${tmdbId}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('average_rating');
        expect(Number(res.body.average_rating)).toBe(10);
    });
});