const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('2. Watchlist Endpoints', () => {
    let token;
    const user = { username: 'watch_user', email: 'watch@test.com', password: '123' };
    const tmdbId = 550; 

    beforeAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
        await request(app).post('/api/auth/register').send(user);
        
        const loginRes = await request(app).post('/api/auth/login').send({
            email: user.email,
            password: user.password
        });
        token = loginRes.body.token; 
    });

    afterAll(async () => {
        await db.query("DELETE FROM users WHERE email = ?", [user.email]);
        await db.query("DELETE FROM films WHERE tmdb_id = ?", [tmdbId]);
    });

    test('POST /api/watchlist - Tambah film ke Watchlist', async () => {
        const res = await request(app)
            .post('/api/watchlist')
            .set('Authorization', `Bearer ${token}`) 
            .send({ 
                tmdb_id: tmdbId, 
                title: 'Fight Club', 
                poster_path: '/poster.jpg' 
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message');
    });

    test('GET /api/watchlist/check/:tmdb_id - Cek apakah film masuk watchlist', async () => {
        const res = await request(app)
            .get(`/api/watchlist/check/${tmdbId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.in_watchlist).toBe(true); 
    });
});